const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { NODE_ENV, REFRESH_TOKEN, FRONTEND_URL } = require('../configs/index');
const { resSuccessObject } = require('../utils/responseObject');
const EmailService = require('../services/emailService');
const passport = require('passport');

class UserController {
  //Register user
  static async createUser(req, res) {
    //Find existing user
    const userExist = await User.findByEmail(req.body.email);

    //Existing user
    if (userExist) {
      return res.status(400).json({ message: 'Email already exist' });
    }

    // Only include allowed fields
    const user = await User.create({ ...req.body });

    res.status(201).json({
      message:
        'User created successfully. Please check your email for verification.',
    });
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

    // Generate token pair
    const { accessToken, refreshToken } = user.generateToken();

    //Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as httpOnly cookie
    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        message: 'Login successful',
        accessToken,
      });
  }

  //Refresh Token
  static async refreshToken(req, res) {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(403).json({ message: 'Refresh token not provided' });
    }

    //Verify refresh token
    const payload = jwt.verify(token, REFRESH_TOKEN);

    //Find user by ID from payload and check if refresh token matches
    const user = await User.findById(payload.id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    //Generate new tokens
    const { accessToken, refreshToken: newRefrshToken } = user.generateToken();

    //Update refresh token in database
    user.refreshToken = newRefrshToken;
    await user.save();

    // Set new refresh token as cookie
    res
      .cookie('refreshToken', newRefrshToken, {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
      })
      .json({ accessToken, message: 'Token refreshed successfully' });
  }

  //Logout
  static async logOut(req, res) {
    const token = req.cookies?.refreshToken;

    if (!token) {
      // Clear cookie anyway and return success
      res.clearCookie('refreshToken');
      return res.status(200).json({ message: 'Logout successful' });
    }

    // Find user with this refresh token and clear it
    const user = await User.findOne({ refreshToken: token });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Logout successful' });
  }

  // Get all users (admin only)
  static async getAllUsers(req, res) {
    const users = await User.find({}, '-password -refreshToken');
    res.json(
      resSuccessObject({
        message: 'Retrived users',
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
    passport.authenticate('google', { session: false }, async (err, user) => {
      if (err) return next(err);
      if (!user)
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);

      const { accessToken, refreshToken } = user.generateToken();

      //Save refresh token to database
      user.refreshToken = refreshToken;
      await user.save();

      res.redirect(
        `${FRONTEND_URL}/login?token=${accessToken}&refresh=${refreshToken}&user=${encodeURIComponent(
          JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          })
        )}`
      );

      if (!user.isEmailVerified) {
        await EmailService.sendWelcomeEmail(user);
        next();
      }
    })(req, res, next);
  }

  // Test endpoint to verify OAuth setup
  static async testGoogleAuth(req, res) {
    res.json({
      message: 'Google OAuth test endpoint',
      googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
      googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
      callbackUrl: '/api/auth/google/callback',
    });
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
        return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);

      const { accessToken, refreshToken } = user.generateToken();

      // Save refresh token to database
      user.refreshToken = refreshToken;
      await user.save();

      res.redirect(
        `${FRONTEND_URL}/login?token=${accessToken}&refresh=${refreshToken}`
      );

      if (!user.isEmailVerified) {
        await EmailService.sendWelcomeEmail(user);
        next();
      }
    })(req, res, next);
  }

  // Get user by ID
  static async getUserById(req, res, next) {
    const user = await User.findById(req.params.id, '-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Allow access if user is admin OR if user is requesting their own data
    if (req.user.role !== 'admin' && req.params.id !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied. You can only access your own profile.',
      });
    }

    res.status(200).json({ user });
  }

  //Update user
  static async updateUser(req, res) {
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
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
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    if (!req.user.id || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin permission required!' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  }
}

module.exports = UserController;
