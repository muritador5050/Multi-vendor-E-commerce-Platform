const express = require('express');
const router = express.Router();
const review = require('../controllers/review.controller');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { validation } = require('../middlewares/validation.middleware');
const { reviewInput } = require('../services/auth.validation');

// Create a new review
router
  .route('/')
  .post(
    authenticate,
    validation(reviewInput),
    asyncHandler(review.createReview)
  )
  .get(asyncHandler(review.getReviews));

// Get average rating for a specific product
router.get(
  '/product/:productId/average-rating',
  asyncHandler(review.getAverageRating)
);

// Toggle review approval status (Admin only)
router.patch(
  '/:id/approve',
  authenticate,
  isAdmin,
  asyncHandler(review.toggleReviewApproval)
);

router
  .route('/:id')
  .get(asyncHandler(review.getReviewById))
  .delete(authenticate, asyncHandler(review.deleteReview));

module.exports = router;
