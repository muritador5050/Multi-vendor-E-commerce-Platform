const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, REFRESH_TOKEN } = require('../configs/index');
const bcrypt = require('bcrypt');
const EmailService = require('../services/emailService');

//Schema
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
      sparse: true, // ensures no unique constraint error for non-Google users
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true, // ensures no unique constraint error for non-Google users
    },
    avatar: String, // Profile image from OAuth provide

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshToken: String,
  },
  { timestamps: true }
);

//Static
userSchema.statics.findByEmail = async function (email) {
  return await this.findOne({ email });
};

//Methods
userSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function () {
  const accessToken = jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  const refreshToken = jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    REFRESH_TOKEN,
    { expiresIn: '30d' }
  );
  return { accessToken, refreshToken };
};

//Method to generate email reset token
userSchema.methods.generateVerificationEmailToken = function () {
  const token = jwt.sign({ id: this._id, email: this.email }, JWT_SECRET, {
    expiresIn: '1h',
  });
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 10000;
  return token;
};

//Method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const token = jwt.sign({ id: this._id, email: this.email }, JWT_SECRET, {
    expiresIn: '10m',
  });
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 10 * 60 * 10000;
  return token;
};

// Pre-save: generate verification token before saving new user
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

userSchema.pre('save', async function (next) {
  //Only hash the password if it's modified or new
  if (!this.isModified('password') || !this.password) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Post-save: send verification email with saved token
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
      next();
    }
  } catch (err) {
    console.error('Post-save email sending error:', err);
    next(); // Still proceed even if email fails
  }
});

module.exports = mongoose.model('User', userSchema);
