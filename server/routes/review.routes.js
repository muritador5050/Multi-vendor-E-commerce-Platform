const express = require('express');
const router = express.Router();
const review = require('../controllers/review.controller');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { validation } = require('../middlewares/validation.middleware');
const { reviewInput } = require('../services/auth.validation');

// Create a new review

router.use(authenticate);

router
  .route('/')
  .post(validation(reviewInput), asyncHandler(review.createReview))
  .get(asyncHandler(review.getReviews));

// Get average rating for a specific product
router.get(
  '/product/:id/average-rating',
  asyncHandler(review.getAverageRating)
);

// Toggle review approval status (Admin only)
router.put('/:id/approve', isAdmin, asyncHandler(review.toggleReviewApproval));

router
  .route('/:id')
  .get(asyncHandler(review.getReviewById))
  .delete(asyncHandler(review.deleteReview));

module.exports = router;
