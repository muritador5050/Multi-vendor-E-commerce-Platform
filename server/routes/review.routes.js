const express = require('express');
const router = express.Router();
const review = require('../controllers/review.controller');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { validation } = require('../middlewares/validation.middleware');
const { reviewInput } = require('../services/auth.validation');

// Create a new review
router.post(
  '/',
  authenticate,
  validation(reviewInput),
  asyncHandler(review.createReview)
);

// Get all reviews (with optional filtering by product via query params)
router.get('/', asyncHandler(review.getReviews));

// Get average rating for a specific product
router.get(
  '/product/:productId/average-rating',
  asyncHandler(review.getAverageRating)
);

// Get a specific review by ID
router.get('/:id', asyncHandler(review.getReviewById));

// Toggle review approval status (Admin only)
router.patch(
  '/:id/approve',
  authenticate,
  isAdmin,
  asyncHandler(review.toggleReviewApproval)
);

// Soft delete a review
router.delete('/:id', authenticate, asyncHandler(review.deleteReview));

module.exports = router;
