const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../configs/index');
const { resSuccessObject } = require('../utils/responseObject');
const EmailService = require('../services/emailService');
const passport = require('passport');

class UserController {
  //Register user
  static async createUser(req, res) {
    //Find existind user
    const findByEmail = await User.findByEmail(req.body.email);
    if (findByEmail) {
      return res.status(400).json({ message: 'User already exist' });
    }

    // Only include allowed fields
    const user = await User.create({ ...req.body });

    res.json(
      resSuccessObject({
        message:
          'User created successfully. Please check your email for verification.',
        results: { userId: user._id },
      })
    );
  }
  //Login user
  static async loginUser(req, res, next) {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isEmailVerified) {
      return res
        .status(401)
        .json({ message: 'Please verify your email first' });
    }

    //Generate token
    const { accessToken, refreshToken } = user.generateToken();

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json(
      resSuccessObject({
        message: 'Login successful',
        accessToken,
        refreshToken,
        results: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    );
  }

  // Get all users (admin only)
  static async getAllUsers(req, res) {
    const users = await User.find({}, '-password, -refreshToken');
    res.json(
      resSuccessObject({
        results: users,
      })
    );
  }

  //Email verification
  static async emailVerification(req, res) {
    //Token
    const { token } = req.params;

    //Model
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    if (user.isEmailVerified) {
      return res.status(200).send('Email already verified.');
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    //Send welcome email
    await EmailService.sendWelcomeEmail(user);
    res.json({ message: 'Email verified successfully' });
  }

  // Request password reset
  static async forgotPassword(req, res) {
    //Find user by email
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    await EmailService.sendPasswordResetEmail(user, resetToken);

    // 5. Respond to client
    res.json({ message: 'Password reset email sent' });
  }

  // Reset password
  static async resetPassword(req, res) {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    // Check if user exists and token hasn't expired
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  }

  // Google OAuth routes (implement with passport-google-oauth20)
  static googleAuth(req, res, next) {
    return passport.authenticate('google', { scope: ['profile', 'email'] })(
      req,
      res,
      next
    );
  }

  static googleCallback(req, res, next) {
    passport.authenticate(
      'google',
      { failureRedirect: '/login' },
      async (err, user) => {
        if (err) return next(err);
        if (!user)
          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=oauth_fialed`
          );

        const { accessToken, refreshToken } = user.generateToken();
        res.redirect(
          `${process.env.FRONTEND_URL}/login?token=${accessToken}&refresh=${refreshToken}`
        );

        if (!user.isEmailVerified) {
          await EmailService.sendWelcomeEmail(user);
          next();
        }
      }
    )(req, res, next);
  }

  //Facebook auth
  static facebookAuth(req, res, next) {
    return passport.authenticate('facebook', { scope: ['email'] })(
      req,
      res,
      next
    );
  }

  //Facebook Callback
  static facebookCallback(req, res, next) {
    passport.authenticate('facebook', { session: false }, async (err, user) => {
      if (err) return next(err);
      if (!user)
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=oauth_failed`
        );

      const { accessToken, refreshToken } = user.generateToken();
      res.redirect(
        `${process.env.FRONTEND_URL}/login?token=${accessToken}&refresh=${refreshToken}`
      );
      if (!user.isEmailVerified) {
        await EmailService.sendWelcomeEmail(user);
        next();
      }
    })(req, res, next);
  }

  //Logout
  static async logOut(req, res) {
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }
    res.json({ message: 'Logged out successfully' });
  }

  // Get user by ID
  static async getUserById(req, res, next) {
    const user = await User.findById(req.params.id, '-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the requesting user's details
    const requestingUser = await User.findById(req.user.id);

    // Allow access if user is admin OR if user is requesting their own data
    if (requestingUser !== 'admin' && req.params.id !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied. You can only access your own profile.',
      });
    }

    res.status(200).json({ user });
  }

  //Update user
  static async updateUser(req, res) {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      {
        new: true,
        runValidators: true,
        select: '-password -refreshToken',
      }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  }

  // Delete user (admin only)
  static async deleteUser(req, res) {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }
    res.json({ message: 'User deleted successfully' });
  }
}

module.exports = UserController;
