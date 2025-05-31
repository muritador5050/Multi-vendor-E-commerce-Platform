const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/review.controller');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { validation } = require('../middlewares/validation.middleware');
const { reviewInput } = require('../services/auth.validation');

// Get all reviews - anyone can view reviews
router.get('/', asyncHandler(ReviewController.getReviews));

// Get single review by ID - anyone can view a specific review
router.get('/:id', asyncHandler(ReviewController.getReviewById));

// Get average rating for a specific product - anyone can view ratings
router.get(
  '/product/:id/average-rating',
  asyncHandler(ReviewController.getAverageRating)
);

// AUTHENTICATED ROUTES (Require login)
// Create a new review - only authenticated users can create reviews
router.post(
  '/',
  authenticate,
  validation(reviewInput),
  asyncHandler(ReviewController.createReview)
);

// Delete review - authenticated users can delete their own reviews, admins can delete any
router.delete(
  '/:id',
  authenticate,
  asyncHandler(ReviewController.deleteReview)
);

// ADMIN ONLY ROUTES
// Toggle review approval status - only admins can approve/disapprove reviews
router.put(
  '/:id/approve',
  authenticate,
  isAdmin,
  asyncHandler(ReviewController.toggleReviewApproval)
);

module.exports = router;
