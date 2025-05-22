const express = require('express');
const router = express.Router();
const User = require('../controllers/user.controllers');
const { authenticate } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { validation } = require('../middlewares/validation.middleware');
const { register, login } = require('../services/auth.validation');

//Register and Login routes
router.post('/register', validation(register), asyncHandler(User.createUser));
router.post('/login', validation(login), asyncHandler(User.loginUser));

//Password reset routes
router.post('/forgot-password', asyncHandler(User.forgotPassword));
router.post('/reset-password/:token', asyncHandler(User.resetPassword));

//Email verification route
router.get('/verify-email/:token', asyncHandler(User.emailVerification));
router.get('/users', asyncHandler(User.getAllUsers));

//oAuth route
router.get('/google', asyncHandler(User.googleAuth));
router.get('/google/callback', asyncHandler(User.googleCallback));

router.get('/facebook', asyncHandler(User.facebookAuth));
router.get('/facebook/callback', asyncHandler(User.facebookCallback));

//Logout
router.get('/logout', asyncHandler(User.logOut));

router.get('/dashboard', authenticate, (req, res) => {
  res.status(200).json({ message: 'welcome to dashboard' });
});

router
  .route('/users/:id')
  .get(asyncHandler(User.getUserById))
  .patch(asyncHandler(User.updateUser))
  .delete(asyncHandler(User.deleteUser));

module.exports = router;
