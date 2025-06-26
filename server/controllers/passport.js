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
        user.isEmailVerified = true; // Trust Google's email verification
        await User.updateOne(
          {
            _id: user._id,
          },
          {
            $set: {
              googleId: profile._id,
              avatar: user.avatar || profile.photos[0].value,
              isEmailVerified: true,
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
        isEmailVerified: true, // Trust Google's email verification
      });
      return done(null, user);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: '123-456-789',
      clientSecret: 'shhh-its-a-secret',
      callbackURL: '/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'email'],
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        //Check if user exist
        let user = await User.findOne({ facebookId: profile.id });
        if (user) return done(null, user);

        // Check if user exists with same email
        if (profile.emails && profile.emails.length > 0) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Facebook account to existing user
            user.facebookId = profile.id;
            user.avatar =
              user.avatar ||
              (profile.photos[0] ? profile.photos[0].value : null);
            user.isEmailVerified = true; // Trust Facebook's email verification
            await user.save({ validateBeforeSave: false });
            return done(null, user);
          }

          //Create new user
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            facebookId: profile.id,
            avatar: profile.photos[0] ? profile.photos[0].value : null,
            isEmailVerified: true, // Trust Facebook's email verification
          });
          return done(null, user);
        } else {
          return done(new Error('No email found in Facebook profile'), null);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
