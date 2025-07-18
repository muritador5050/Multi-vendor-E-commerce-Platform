const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../configs/index');
const User = require('../models/user.model');

const authenticate = async (req, res, next) => {
  try {
    // Get token from header or cookie
    const authHeader = req.headers['authorization'];
    const headerToken = authHeader && authHeader.split(' ')[1];
    const cookieToken = req.cookies?.jwt;
    const token = headerToken || cookieToken;

    if (!token) {
      return res.status(401).json({
        message: 'Access denied. No token provided.',
      });
    }
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find user and validate existence
    const user = await User.findById(decoded.id).select(
      '-password -refreshToken -__v'
    );

    if (!user) {
      return res.status(401).json({
        message: 'User not found or token invalid.',
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        message: 'Account has been deactivated.',
      });
    }

    // Check token version (for token invalidation)
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({
        message: 'Token has been invalidated. Please log in again.',
      });
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({
        message: 'Please verify your email address.',
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token has expired.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token.',
      });
    }

    // Database or other errors
    console.error('Authentication error:', error);
    return res.status(500).json({
      message: 'Authentication failed. Please try again.',
    });
  }
};

module.exports = { authenticate };
