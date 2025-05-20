const User_model = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../configs/index');
const { resSuccessObject } = require('../utils/responseObject');
const EmailService = require('../services/emailService');
const passport = require('passport');

//Controller
class User {
  //Create users
  static async createUser(req, res) {
    const findByEmail = await User_model.findByEmail(req.body.email);
    if (findByEmail) {
      return res
        .status(400)
        .json({ message: 'User with this email already exist' });
    }

    // Only include allowed fields
    const user = await User_model.create({ ...req.body });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(
      resSuccessObject({
        message:
          'User created successfully. Please verify your email to login!',
        results: { user: userResponse },
      })
    );
  }

  //Email verification
  static async emailVerification(req, res) {
    //Token
    const { token } = req.params;
    const decode = jwt.verify(token, JWT_SECRET);

    //Model
    const user = await User_model.findOne({
      _id: decode.id,
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired verification token',
      });
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
    res.json(
      resSuccessObject({
        message: 'Email verified successfully.',
      })
    );
  }

  //Login users
  static async loginUser(req, res, next) {
    const { email, password } = req.body;

    const user = await User_model.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: 'User with this email does not exist' });
    }

    if (!user.isEmailVerified) {
      return next(new Error('Please Verify Your Email First!', { cause: 404 }));
    }

    //Check password
    const isMatch = await user.checkPassword(password);
    if (!isMatch) return next(new Error('Invalid Password!', { cause: 404 }));

    //Generate token
    const token = user.generateToken();

    res.status(200).json(
      resSuccessObject({
        message: 'Login successful',
        results: { token },
      })
    );
  }

  // Request password reset
  static async forgotPassword(req, res) {
    //Find user by email
    const user = await User_model.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with that email does not exist',
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    await EmailService.sendPasswordResetEmail(user, resetToken);

    // 5. Respond to client
    return res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  }

  // Reset password with token
  static async resetPassword(req, res) {
    const { token } = req.params;
    const decode = jwt.verify(token, JWT_SECRET);

    if (!req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'New password is required',
      });
    }

    const user = await User_model.findOne({
      _id: decode.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    // Check if user exists and token hasn't expired
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token is invalid or has expired',
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const generateToken = (userId) => {
      return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: '30d',
      });
    };
    // Generate JWT token for auto login
    const jwtToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token: jwtToken,
    });
  }

  //Google auth
  static googleAuth(req, res, next) {
    return passport.authenticate('google', { scope: ['profile', 'email'] })(
      req,
      res,
      next
    );
  }

  //Google Callback
  static googleCallback(req, res, next) {
    passport.authenticate(
      'google',
      { failureRedirect: '/login' },
      async (err, user) => {
        if (err || !user) {
          return res.redirect('/login?error=auth_failed');
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, {
          expiresIn: '30d',
        });

        res.cookie('jwt', token, {
          expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
        });

        if (!user.isEmailVerified) {
          EmailService.sendWelcomeEmail(user).catch((err) =>
            console.error('Welcome email error:', err)
          );
        }

        return res.redirect('/dashboard');
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
    passport.authenticate(
      'facebook',
      { failureRedirect: '/login' },
      async (err, user) => {
        if (err || !user) {
          return res.redirect('/login?error=auth_failed');
        }

        const generateToken = (userId) => {
          return jwt.sign({ id: userId }, JWT_SECRET, {
            expiresIn: '30d',
          });
        };
        // Generate JWT token for auto login
        const token = generateToken(user._id);

        res.cookie('jwt', token, {
          expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
        });

        try {
          await EmailService.sendWelcomeEmail(user);
        } catch (error) {
          console.error('Error sending welcome email:', error);
        }

        return res.redirect('/dashboard');
      }
    )(req, res, next);
  }

  static logOut(req, res) {
    res.clearCookie('jwt');
    res.redirect('/');
  }

  //Get all users
  static async getAllUsers(req, res) {
    const users = await User_model.find().select('-password');
    res.status(200).json({
      success: true,
      users,
    });
  }

  //Get a single user
  static async getUserById(req, res, next) {
    const user = await User_model.findById(req.params.id).select('-password');

    if (!user)
      return next(new Error(`User with this id:${req.params.id} not exist`), {
        cause: 400,
      });

    res.status(200).json({
      success: true,
      user,
    });
  }

  static async updateUser(req, res) {
    const updated = await User_model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
        select: '-password',
      }
    );

    if (!updated) {
      return res.status(404).json({ message: 'User not found!' });
    }
    res.status(200).json({ message: 'Updated successfully', user: updated });
  }

  //Delete user
  static async deleteUser(req, res) {
    const findUser = await User_model.findByIdAndDelete(req.params.id);

    if (!findUser) {
      return res.status(400).json({ message: 'User not found!' });
    }
    res.status(200).json({ message: 'deleted successfully' });
  }
}

module.exports = User;
