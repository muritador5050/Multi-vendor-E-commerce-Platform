const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, REFRESH_TOKEN } = require('../configs/index');
const bcrypt = require('bcrypt');
const EmailService = require('../services/emailService');

/**
 * @openapi
 * components:
 *   schemas:
 *     UserRegister:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           example: user@example.com
 *         password:
 *           type: string
 *           example: StrongPassword123!
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *         role:
 *            type: string
 *            enum: [customer, admin, vendor]
 *            default: customer
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               example: "123 Main St"
 *             city:
 *               type: string
 *               example: "New York"
 *             state:
 *               type: string
 *               example: "NY"
 *             zipCode:
 *               type: string
 *               example: "10001"
 *             country:
 *               type: string
 *               example: "USA"
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     UserLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     UserPublic:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "64d7a8a6bcf86cd799439011"
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           example: user@example.com
 *         role:
 *           type: string
 *           enum: [customer, admin, vendor]
 *         isActive:
 *           type: boolean
 *           example: true
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *         avatar:
 *           type: string
 *           example: "https://example.com/avatar.png"
 *         isEmailVerified:
 *           type: boolean
 *           example: false || true
 *         address:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               example: "123 Main St"
 *             city:
 *               type: string
 *               example: "New York"
 *             state:
 *               type: string
 *               example: "NY"
 *             zipCode:
 *               type: string
 *               example: "10001"
 *             country:
 *               type: string
 *               example: "USA"
 */

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.facebookId;
      },
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'vendor'],
      default: 'customer',
    },

    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },

    phone: { type: String, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    // OAuth fields
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: String,

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    profileCompletion: Number,

    tokenVersion: {
      type: Number,
      default: 1,
    },

    // Email verification
    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // Password reset
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Refresh token
    refreshToken: String,
  },
  { timestamps: true }
);

// ============================================================================
// STATIC METHODS (Best Practice: Individual assignments)
// ============================================================================

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

userSchema.statics.findByIdAndValidate = async function (id) {
  const user = await this.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

userSchema.statics.alreadyExists = async function (email) {
  const userExists = await this.findByEmail(email);
  if (userExists) {
    throw new Error('Email already exists');
  }
  return userExists;
};

userSchema.statics.createIfNotExists = async function (userData) {
  await this.alreadyExists(userData.email);
  return this.create(userData);
};

userSchema.statics.createVendor = async function (userData, role = 'vendor') {
  await this.alreadyExists(userData.email);
  return this.create({ ...userData, role });
};

// Authentication methods
userSchema.statics.findByEmailAndValidateCredential = async function (
  email,
  password
) {
  const user = await this.findByEmail(email);
  if (!user || !(await user.checkPassword(password))) {
    throw new Error('Invalid credentials');
  }
  return user;
};

// Token-related methods
userSchema.statics.findResetToken = async function (token) {
  const user = await this.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error('Invalid or expired token');
  }
  return user;
};

userSchema.statics.findByVerificationToken = async function (token) {
  const user = await this.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new Error('Invalid verification token');
  }
  return user;
};

userSchema.statics.findByRefreshToken = async function (refreshToken) {
  const user = await this.findOne({ refreshToken });
  if (!user) {
    throw new Error('Invalid refresh token');
  }
  return user;
};

// Search and pagination methods
userSchema.statics.buildSearchFilter = function (query) {
  const filter = {};

  if (query.role) {
    filter.role = query.role;
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }

  if (query.isEmailVerified !== undefined) {
    filter.isEmailVerified = query.isEmailVerified === 'true';
  }

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  return filter;
};

userSchema.statics.findWithPagination = async function (filter, options) {
  const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
  const skip = (page - 1) * limit;

  const users = await this.find(filter, '-password -refreshToken')
    .skip(skip)
    .limit(limit)
    .sort(sort);

  const total = await this.countDocuments(filter);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Utility methods
userSchema.statics.findActiveUsers = async function () {
  return await this.find({ isActive: true }).select(
    'name email role isEmailVerified createdAt updatedAt avatar isActive'
  );
};

userSchema.statics.processOAuthCallback = async function (user, frontendUrl) {
  const { accessToken, refreshToken } = user.generateToken();
  user.refreshToken = refreshToken;
  await user.save();

  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return {
    redirectUrl: `${frontendUrl}/oauth/callback?token=${accessToken}&refresh=${refreshToken}&user=${encodeURIComponent(
      JSON.stringify(userData)
    )}`,
    shouldSendWelcome: !user.isEmailVerified,
  };
};

// ============================================================================
// INSTANCE METHODS (Best Practice: Individual assignments)
// ============================================================================

// Authentication methods
userSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function (options = {}) {
  const { accessTokenExpiry = '15m', refreshTokenExpiry = '7d' } = options;

  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
    tokenVersion: this.tokenVersion,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: accessTokenExpiry,
  });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN, {
    expiresIn: refreshTokenExpiry,
  });

  return { accessToken, refreshToken };
};

// Token management methods
userSchema.methods.loginWithTokens = function (tokenOptions = {}) {
  const { accessToken, refreshToken } = this.generateToken(tokenOptions);
  this.refreshToken = refreshToken;
  return { accessToken, refreshToken, user: this };
};

userSchema.methods.refreshTokens = function () {
  const { accessToken, refreshToken: newRefreshToken } = this.generateToken();
  this.refreshToken = newRefreshToken;
  return { accessToken, refreshToken: newRefreshToken };
};

userSchema.methods.updateRefreshToken = function (refreshToken) {
  this.refreshToken = refreshToken;
  return this.save();
};

userSchema.methods.clearRefreshToken = function () {
  this.refreshToken = null;
  return this.save();
};

userSchema.methods.invalidateAllTokens = function () {
  this.tokenVersion += 1;
  return this.save();
};

// Email verification methods
userSchema.methods.isEmailAlreadyVerified = function () {
  return this.isEmailVerified;
};

userSchema.methods.verifyEmail = function () {
  this.isEmailVerified = true;
  this.emailVerificationToken = undefined;
  this.emailVerificationExpires = undefined;
  return this.save();
};

userSchema.methods.generateVerificationEmailToken = function () {
  const token = jwt.sign({ id: this._id, email: this.email }, JWT_SECRET, {
    expiresIn: '1h',
  });
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

userSchema.methods.sendWelcomeEmail = async function () {
  await EmailService.sendWelcomeEmail(this);
};

// Password reset methods
userSchema.methods.createPasswordResetToken = function () {
  const token = jwt.sign({ id: this._id, email: this.email }, JWT_SECRET, {
    expiresIn: '10m',
  });
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  return token;
};

userSchema.methods.resetPassword = function (newPassword) {
  this.password = newPassword;
  this.resetPasswordToken = undefined;
  this.resetPasswordExpires = undefined;
  return this.save();
};

userSchema.methods.processPasswordReset = async function (resetToken) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await EmailService.sendPasswordResetEmail(this, resetToken);
  return resetLink;
};

// User status methods
userSchema.methods.activate = function () {
  this.isActive = true;
  return this.save();
};

userSchema.methods.deactivate = function () {
  this.isActive = false;
  this.tokenVersion += 1;
  return this.save();
};

userSchema.methods.isAlreadyActive = function () {
  return this.isActive;
};

userSchema.methods.isAlreadyDeactivated = function () {
  return !this.isActive;
};

// Permission methods
userSchema.methods.canAccessUser = function (requestedUserId, userRole) {
  return userRole === 'admin' || this._id.toString() === requestedUserId;
};

userSchema.methods.canDeactivateUser = function (
  targetUserId,
  currentUserRole
) {
  const currentUserId = this._id.toString();

  // Admin can deactivate others but not themselves
  if (currentUserRole === 'admin' && currentUserId !== targetUserId) {
    return true;
  }

  // User can deactivate themselves (if not admin)
  if (currentUserRole !== 'admin' && currentUserId === targetUserId) {
    return true;
  }

  return false;
};

userSchema.methods.canInvalidateTokens = function (
  targetUserId,
  currentUserRole
) {
  const currentUserId = this._id.toString();
  return currentUserRole === 'admin' || currentUserId === targetUserId;
};

// Data retrieval methods
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  return user;
};

userSchema.methods.getStatusInfo = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    isActive: this.isActive,
    isEmailVerified: this.isEmailVerified,
    role: this.role,
    tokenVersion: this.tokenVersion,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// ============================================================================
// MIDDLEWARE (Pre/Post hooks)
// ============================================================================

userSchema.pre('save', async function (next) {
  // Check if this is a Google or Facebook user and skip token generation
  if ((this.googleId || this.facebookId) && this.isEmailVerified) {
    return next();
  }

  if (this.isNew || !this.isEmailVerified) {
    this.generateVerificationEmailToken();
  }

  next();
});

// Pre-save: Hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Pre-save: Auto-activate when email is verified
userSchema.pre('save', function (next) {
  if (this.isEmailVerified && this.isModified('isEmailVerified')) {
    this.isActive = true;
  }
  next();
});

// Post-save: Send verification email for new users
userSchema.post('save', async function (doc, next) {
  try {
    if (
      doc.createdAt.getTime() === doc.updatedAt.getTime() &&
      !doc.googleId &&
      !doc.facebookId &&
      !doc.isEmailVerified &&
      doc.emailVerificationToken
    ) {
      await EmailService.sendVerificationEmail(doc, doc.emailVerificationToken);
    }
    next();
  } catch (err) {
    console.error('Post-save email sending error:', err);
    next();
  }
});

module.exports = mongoose.model('User', userSchema);
