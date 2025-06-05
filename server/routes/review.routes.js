const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/review.controller');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { validation } = require('../middlewares/validation.middleware');
const { reviewInput } = require('../services/auth.validation');

/**
 * @openapi
 * tags:
 *   name: Reviews
 *   description: API endpoints for managing product reviews
 */
router.get('/', asyncHandler(ReviewController.getReviews));

/**
 * @openapi
 * /reviews:
 *   get:
 *     summary: Get all reviews
 *     tags: [Reviews]
 *     responses:
 *       '200':
 *         description: List of all reviews
 *       '500':
 *         description: Internal server error
 */
router.get('/:id', asyncHandler(ReviewController.getReviewById));

/**
 * @openapi
 * /product/{id}/reviews:
 *   get:
 *     summary: Get all reviews for a specific product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to get reviews for
 *     responses:
 *       '200':
 *         description: List of reviews for the specified product
 *       '404':
 *         description: Product not found
 */
router.get(
  '/product/:id/average-rating',
  asyncHandler(ReviewController.getAverageRating)
);

/**
 * @openapi
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Review created successfully
 *       '400':
 *         description: Bad request, validation error
 *       '401':
 *         description: Unauthorized, user not authenticated
 */
router.post(
  '/',
  authenticate,
  validation(reviewInput),
  asyncHandler(ReviewController.createReview)
);

/**
 * @openapi
 * /reviews/{id}:
 *   put:
 *     summary: Update an existing review
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the review to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Review updated successfully
 *       '400':
 *         description: Bad request, validation error
 *       '401':
 *         description: Unauthorized, user not authenticated
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(ReviewController.deleteReview)
);

/**
 * @openapi
 * /reviews/{id}/approve:
 *   put:
 *     summary: Approve or disapprove a review (admin only)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the review to approve/disapprove
 *     responses:
 *       '200':
 *         description: Review approval status toggled successfully
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, user does not have permission to approve reviews
 */
router.put(
  '/:id/approve',
  authenticate,
  isAdmin,
  asyncHandler(ReviewController.toggleReviewApproval)
);

module.exports = router;
