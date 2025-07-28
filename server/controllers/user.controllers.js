const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const {
  NODE_ENV,
  REFRESH_TOKEN,
  FRONTEND_URL,
  BACKEND_URL,
} = require('../configs/index');
const passport = require('passport');
const path = require('path');
const fs = require('fs');
const { getFilteredUpdateData } = require('../utils/ValidateFieldPermission');
const { deleteFile } = require('../utils/FileUploads');

class UserController {
  //Register user
  static async registerUser(req, res) {
    const user = await User.createIfNotExists(req.body);
    await user.sendVerificationEmail();

    res.status(201).json({
      success: true,
      message:
        'User created successfully. Please check your email for verification.',
    });
  }

  //Register vendor
  static async registerVendorUser(req, res) {
    const user = await User.createVendor(req.body);
    await user.sendVerificationEmail();

    res.status(201).json({
      success: true,
      message:
        'User created successfully. Please check your email for verification.',
    });
  }

  //Login user
  static async loginUser(req, res) {
    const { email, password, rememberMe } = req.body;

    const user = await User.findByEmailAndValidateCredential(email, password);

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message:
          'Your account as been deactivated please contact admin for further information',
      });
    }

    const warnings = [];
    if (!user.isEmailVerified) {
      warnings.push('Please verify your email address to access all features.');
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
    user.isOnline = true;
    user.lastSeen = new Date();
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
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: user.getStatusInfo(),
        accessToken,
        warnings,
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

  //Update user
  static async updateUserProfile(req, res) {
    const currentUser = await User.findByIdAndValidate(req.user.id);

    if (!currentUser.canUpdateUser(req.params.id, req.user.role)) {
      return res.status(403).json({
        message: 'Access denied. You can only edit your own profile.',
      });
    }

    const targetUser = await User.findByIdAndValidate(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const updateData = getFilteredUpdateData(req.body, req.user.role);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: 'Insufficient permission to update this field .',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(500).json({
        message: 'Failed to update user. Please try again.',
      });
    }

    return res.status(200).json({
      message: 'User updated successfully',
      data: updatedUser.getPublicProfile(),
    });
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
    res.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        user: user.getPublicProfile(),
      },
    });
  }

  //Email verification
  static async emailVerification(req, res) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Verification token is required',
        });
      }

      const user = await User.findByVerificationToken(token);

      if (user.isEmailAlreadyVerified()) {
        return res.status(200).json({
          success: true,
          message: 'Email is already verified.',
        });
      }

      await user.verifyEmail();
      await user.sendWelcomeEmail();

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      console.error('Email verification error:', error);

      // Handle specific error types
      if (error.message.includes('expired')) {
        return res.status(400).json({
          success: false,
          message: 'Verification token has expired. Please request a new one.',
          code: 'TOKEN_EXPIRED',
        });
      }

      if (error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid verification token. Please check the link or request a new one.',
          code: 'TOKEN_INVALID',
        });
      }

      res.status(500).json({
        success: false,
        message:
          'An error occurred during email verification. Please try again.',
      });
    }
  }

  static async verifyUserByAdmin(req, res) {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await User.findByIdAndValidate(req.params.id);

    await user.toggleEmailVerification();

    res.json({
      success: true,
      message: `User ${
        user.isEmailVerified ? 'verified' : 'unverified'
      } successfully`,
      data: user,
    });
  }

  static async resendEmailVerification(req, res) {
    const user = await User.findByIdAndValidate(req.user.id);

    if (user.isEmailAlreadyVerified()) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified.',
      });
    }
    await user.sendResendVerificationEmail();
    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.',
    });
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

      if (!user.isActive) {
        return res.redirect(
          `${FRONTEND_URL}/oauth/callback?error=account_inactive`
        );
      }

      const { redirectUrl, shouldSendVerification, shouldSendWelcome } =
        await User.processOAuthCallback(user, FRONTEND_URL);

      if (shouldSendVerification) {
        await user.sendVerificationEmail();
      }

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
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users: result.users,
        pagination: result.pagination,
      },
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
    res.status(200).json({
      success: true,
      message: 'User detail retrived successfully',
      data: user.getPublicProfile(),
    });
  }

  // Set user online
  static async setUserOnline(req, res) {
    const user = await User.findByIdAndValidate(req.user.id);

    await user.setOnline();

    return res.status(200).json({
      success: true,
      message: 'User is online',
      data: {
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      },
    });
  }

  // Set user offline
  static async setUserOffline(req, res) {
    const user = await User.findByIdAndValidate(req.user.id);

    await user.setOffline();

    return res.status(200).json({
      success: true,
      message: 'User is offline',
      data: {
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      },
    });
  }

  static async updateUserHeartbeat(req, res) {
    const user = await User.findByIdAndValidate(req.user.id);
    await user.setOnline();
    res.status(200).json({ success: true });
  }

  static async getOnlineUsers(req, res) {
    const minutesAgo = req.query.minutes || 5;
    const timeThreshold = new Date(Date.now() - minutesAgo * 60 * 1000);

    const onlineUsers = await User.find({
      isActive: true,
      lastSeen: { $gte: timeThreshold },
      isOnline: true,
    }).select('_id name email role isOnline lastSeen');

    return res.status(200).json({
      success: true,
      message: 'Online users retrieved',
      data: onlineUsers,
    });
  }

  // Delete user (admin only)
  static async deleteUser(req, res) {
    await User.findByIdAndValidate(req.params.id);

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Only admin has the permission to delete user account!',
      });
    }

    if (req.user.role === 'admin' && req.user.id === req.params.id) {
      return res
        .status(403)
        .json({ message: "Admin can't delete their own profile" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
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
    const { reason } = req.body;

    const currentUser = await User.findByIdAndValidate(req.user.id);

    if (!currentUser.canInvalidateTokens(id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to invalidate tokens for this user.',
      });
    }

    const user = await User.findByIdAndValidate(id);
    const invalidationTimestamp = new Date();

    await user.invalidateAllTokens();

    console.log(
      `Tokens invalidated for user ${id} by ${
        req.user.id
      } at ${invalidationTimestamp}${reason ? ` - Reason: ${reason}` : ''}`
    );

    res.json({
      success: true,
      message:
        'All user tokens invalidated successfully. User will need to login again.',
      data: {
        invalidatedAt: invalidationTimestamp,
        reason: reason || 'Not specified',
      },
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

  // Upload avatar controller
  static async uploadAvatar(req, res) {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Get the user
    const user = await User.findById(req.user.id);
    if (!user) {
      // Clean up uploaded file if user not found
      await deleteFile(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete old avatar if it exists and is not default
    if (user.avatar && !user.avatar.includes('default-avatar')) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      await deleteFile(oldAvatarPath).catch((err) =>
        console.error('Error deleting old avatar:', err)
      );
    }

    const avatarPath = `uploads/avatars/${req.file.filename}`;
    const fullAvatarUrl =
      `${BACKEND_URL}/${avatarPath}` ||
      `${req.protocol}://${req.get('host')}${avatarPath}`;
    user.avatar = fullAvatarUrl;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        filename: req.file.filename,
        path: avatarPath,
        size: req.file.size,
        mimetype: req.file.mimetype,
        avatar: fullAvatarUrl,
      },
    });
  }

  // Delete user avatar
  static async deleteAvatar(req, res) {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.avatar || user.avatar.includes('default-avatar')) {
      return res.status(400).json({
        success: false,
        message: 'No custom avatar to delete',
      });
    }

    // Delete the file
    const avatarPath = path.join(__dirname, '..', user.avatar);
    await deleteFile(avatarPath);

    // Reset to default avatar
    user.avatar = 'uploads/avatars/default-avatar.png';
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Avatar deleted successfully',
      data: {
        avatar: user.avatar,
      },
    });
  }
}

module.exports = UserController;
