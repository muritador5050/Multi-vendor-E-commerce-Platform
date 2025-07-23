const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user.model');
require('dotenv').config();

//Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async function (accessToken, refreshToken, profile, done) {
      //Check if user exist
      let user = await User.findOne({ googleId: profile.id });
      if (user) return done(null, user);

      // Check if user exists with same email
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.avatar = user.avatar || profile.photos[0].value;
        user.isEmailVerified = true;
        user.isActive = true;
        await User.updateOne(
          {
            _id: user._id,
          },
          {
            $set: {
              googleId: profile.id,
              avatar: user.avatar || profile.photos[0].value,
              isEmailVerified: true,
              isActive: true,
            },
          }
        );

        // Fetch the updated user
        user = await User.findById(user._id);
        return done(null, user);
      }

      //Create new user
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        avatar: profile.photos[0].value,
        isEmailVerified: true,
        isActive: true,
      });
      return done(null, user);
    }
  )
);

module.exports = passport;
