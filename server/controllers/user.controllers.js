const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { NODE_ENV, REFRESH_TOKEN, FRONTEND_URL } = require('../configs/index');
const EmailService = require('../services/emailService');
const passport = require('passport');
const {
  calculateProfileCompletion,
} = require('../utils/calculateProfileCompletion');

class UserController {
  //Register user
  static async createUser(req, res) {
    await User.createIfNotExists(req.body);
    res.status(201).json({
      message:
        'User created successfully. Please check your email for verification.',
    });
  }

  //Register vendor
  static async registerVendor(req, res) {
    await User.createVendor(req.body);
    res.status(201).json({
      message:
        'User created successfully. Please check your email for verification.',
    });
  }

  //Login user
  static async loginUser(req, res) {
    const { email, password, rememberMe } = req.body;

    const user = await User.findByEmailAndValidateCredential(email, password);
    if (!user.isEmailVerified) {
      return res
        .status(401)
        .json({ message: 'Please verify your email first' });
    }

    const tokenOptions = rememberMe
      ? {
          accessTokenExpiry: '15m',
          refreshTokenExpiry: '30d',
        }
      : {
          accessTokenExpiry: '15m',
          refreshTokenExpiry: '7d',
        };

    const { accessToken, refreshToken } = user.loginWithTokens(tokenOptions);
    await user.save();

    const cookieMaxAge = rememberMe
      ? 30 * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;

    const cookieOptions = {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: cookieMaxAge,
    };

    res.cookie('refreshToken', refreshToken, cookieOptions).json({
      data: {
        user: user.getPublicProfile(),
        accessToken,
      },
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
    const { accessToken, refreshToken: newRefreshToken } = user.refreshTokens();
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    res
      .cookie('refreshToken', newRefreshToken, cookieOptions)
      .json({ accessToken, message: 'Token refreshed successfully' });
  }

  //Logout
  static async logOut(req, res) {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: NODE_ENV === 'production',
        sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
      });
      return res.status(200).json({ message: 'Logout successful' });
    }

    const user = await User.findByRefreshToken(token);
    if (user) {
      await user.clearRefreshToken();
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    });
    res.status(200).json({ message: 'Logout successful' });
  }

  // Get user profile
  static async getUserProfile(req, res) {
    const user = await User.findByIdAndValidate(req.user.id);
    const completion = calculateProfileCompletion(user);
    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        profileCompletion: completion,
      },
    });
  }

  //Email verification
  static async emailVerification(req, res) {
    const { token } = req.params;

    const user = await User.findByVerificationToken(token);

    if (user.isEmailAlreadyVerified()) {
      return res.status(200).send('Email already verified.');
    }

    await user.verifyEmail();
    await user.sendWelcomeEmail();

    res.json({ message: 'Email verified successfully' });
  }

  // Request password reset
  static async forgotPassword(req, res) {
    if (!req.body.email) {
      return res.status(400).json({
        message: 'Please provide an email address',
      });
    }

    const user = await User.findByEmail(req.body.email.toLowerCase().trim());

    if (!user) {
      return res.status(200).json({
        message:
          'If this email is registered, you will receive a password reset link shortly. Check your inbox and spam folder.',
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    await user.processPasswordReset(resetToken);

    res.status(200).json({
      message:
        'If this email is registered, you will receive a password reset link shortly. Check your inbox and spam folder.',
    });
  }

  // Reset password
  static async resetPassword(req, res) {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findResetToken(token);
    await user.resetPassword(password);

    res.json({ message: 'Password reset successful' });
  }

  static googleAuth(req, res, next) {
    return passport.authenticate('google', { scope: ['profile', 'email'] })(
      req,
      res,
      next
    );
  }

  // Google OAuth callback
  static googleCallback(req, res, next) {
    passport.authenticate('google', { session: false }, async (err, user) => {
      if (err) return next(err);
      if (!user) {
        return res.redirect(
          `${FRONTEND_URL}/oauth/callback?error=oauth_failed`
        );
      }

      const { redirectUrl, shouldSendWelcome } =
        await User.processOAuthCallback(user, FRONTEND_URL);

      if (shouldSendWelcome) {
        await user.sendWelcomeEmail();
      }

      res.redirect(redirectUrl);
    })(req, res, next);
  }

  // Get all users
  static async getAllUsers(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = User.buildSearchFilter(req.query);
    const result = await User.findWithPagination(filter, { page, limit });

    res.status(200).json({
      data: result.users,
      pagination: result.pagination,
    });
  }

  // Get user by ID
  static async getUserById(req, res) {
    const currentUser = await User.findByIdAndValidate(req.user.id);

    if (!currentUser.canAccessUser(req.params.id, req.user.role)) {
      return res.status(403).json({
        message: 'Access denied. You can only access your own profile.',
      });
    }

    const user = await User.findByIdAndValidate(req.params.id);
    res.status(200).json({ data: user.getPublicProfile() });
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
      }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ data: user.getPublicProfile() });
  }

  // Delete user (admin only)
  static async deleteUser(req, res) {
    await User.findByIdAndValidate(req.params.id);

    if (!req.user.id || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin permission required!' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  }

  //Deactivate user
  static async deactivateUser(req, res) {
    const { id } = req.params;
    const currentUser = await User.findByIdAndValidate(req.user.id);

    if (!currentUser.canDeactivateUser(id, req.user.role)) {
      const message =
        req.user.role === 'admin' && req.user.id === id
          ? 'Admins cannot deactivate their own accounts.'
          : 'Insufficient permissions to deactivate this user';
      return res.status(403).json({ success: false, message });
    }

    const user = await User.findByIdAndValidate(id);

    if (user.isAlreadyDeactivated()) {
      return res
        .status(400)
        .json({ success: false, message: 'User is already deactivated.' });
    }

    await user.deactivate();

    res.json({
      success: true,
      message: 'User account deactivated successfully.',
      data: {
        id: user._id,
        isActive: user.isActive,
        tokenVersion: user.tokenVersion,
      },
    });
  }

  // Activate user - simplified
  static async activateUser(req, res) {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can activate user accounts.',
      });
    }

    const user = await User.findByIdAndValidate(id);

    if (user.isAlreadyActive()) {
      return res
        .status(400)
        .json({ success: false, message: 'User is already active.' });
    }

    await user.activate();

    res.json({
      success: true,
      message: 'User account activated successfully.',
      data: { id: user._id, isActive: user.isActive },
    });
  }

  // Invalidate user tokens
  static async invalidateUserTokens(req, res) {
    const { id } = req.params;
    const currentUser = await User.findByIdAndValidate(req.user.id);

    if (!currentUser.canInvalidateTokens(id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to invalidate tokens for this user.',
      });
    }

    const user = await User.findByIdAndValidate(id);
    await user.invalidateAllTokens();

    res.json({
      success: true,
      message:
        'All user tokens invalidated successfully. User will need to login again.',
      data: { id: user._id, tokenVersion: user.tokenVersion },
    });
  }

  static async getActiveUsers(req, res) {
    const currentUser = req.user;

    if (currentUser.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view all active users.',
      });
    }

    const users = await User.findActiveUsers();
    res.json({
      success: true,
      data: users,
      count: users.length,
    });
  }

  // Get user status - simplified
  static async getUserStatus(req, res) {
    const { id } = req.params;
    const currentUser = await User.findByIdAndValidate(req.user.id);

    if (!currentUser.canAccessUser(id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to view this user's status.",
      });
    }

    const user = await User.findByIdAndValidate(id);
    res.json({
      success: true,
      data: user.getStatusInfo(),
    });
  }
}

module.exports = UserController;
