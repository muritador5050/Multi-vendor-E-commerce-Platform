const express = require('express');
const router = express.Router();
const User = require('../controllers/user.controllers');
const { authenticate } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { validation } = require('../middlewares/validation.middleware');
const { register, login } = require('../services/auth.validation');

//Register and Login routes
router.post(
  '/auth/register',
  validation(register),
  asyncHandler(User.createUser)
);
router.post('/auth/login', validation(login), asyncHandler(User.loginUser));

//Password reset routes
router.post('/auth/forgot-password', asyncHandler(User.forgotPassword));
router.post('/auth/reset-password/:token', asyncHandler(User.resetPassword));

//Email verification route
router.get('/auth/verify-email/:token', asyncHandler(User.emailVerification));
router.get('/users', asyncHandler(User.getAllUsers));

//oAuth route
router.get('/auth/google', asyncHandler(User.googleAuth));
router.get('/auth/google/callback', asyncHandler(User.googleCallback));

router.get('/auth/facebook', asyncHandler(User.facebookAuth));
router.get('/auth/facebook/callback', asyncHandler(User.facebookCallback));

//Logout
router.get('/logout', asyncHandler(User.logOut));

router.get('/dashboard', authenticate, (req, res) => {
  res.status(200).json({ message: 'welcome to dashboard' });
});

router
  .route('/user/:id')
  .get(asyncHandler(User.getUserById))
  .patch(asyncHandler(User.updateUser))
  .delete(asyncHandler(User.deleteUser));

module.exports = router;
