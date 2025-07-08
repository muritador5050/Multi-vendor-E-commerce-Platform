const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');
const { validation } = require('../middlewares/validation.middleware');
const { reviewInput } = require('../services/auth.validation');

/**
 * @openapi
 * tags:
 *   name: Reviews
 *   description: API endpoints for managing product reviews
 */

/**
 * @openapi
 * /reviews:
 *   get:
 *     summary: Get all reviews
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of reviews per page
 *       - in: query
 *         name: product
 *         schema:
 *           type: string
 *         description: Filter by product ID
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: isApproved
 *         schema:
 *           type: boolean
 *         description: Filter by approval status
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Minimum rating filter
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Maximum rating filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, rating]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       '200':
 *         description: List of reviews with pagination
 *       '400':
 *         description: Invalid query parameters
 *       '500':
 *         description: Internal server error
 */
router.get('/', asyncHandler(ReviewController.getReviews));

/**
 * @openapi
 * /reviews/{id}:
 *   get:
 *     summary: Get a single review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the review to retrieve
 *     responses:
 *       '200':
 *         description: Review details
 *       '400':
 *         description: Invalid review ID
 *       '404':
 *         description: Review not found
 *       '500':
 *         description: Internal server error
 */
router.get('/:id', asyncHandler(ReviewController.getReviewById));

/**
 * @openapi
 * /reviews/product/{id}/average-rating:
 *   get:
 *     summary: Get average rating for a specific product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to get average rating for
 *     responses:
 *       '200':
 *         description: Average rating and total reviews for the product
 *       '400':
 *         description: Invalid product ID
 *       '500':
 *         description: Internal server error
 */
router.get(
  '/product/:id/average-rating',
  asyncHandler(ReviewController.getAverageRating)
);

/**
 * @openapi
 * /reviews/stats:
 *   get:
 *     summary: Get review statistics (admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Review statistics
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Admin access required
 *       '500':
 *         description: Internal server error
 */
router.get(
  '/stats',
  authenticate,
  checkRole('admin', 'read'),
  asyncHandler(ReviewController.getReviewStats)
);

/**
 * @openapi
 * /reviews:
 *   post:
 *     summary: Create a new review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product
 *               - rating
 *             properties:
 *               product:
 *                 type: string
 *                 description: Product ID
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1 to 5
 *               comment:
 *                 type: string
 *                 description: Optional review comment
 *     responses:
 *       '201':
 *         description: Review created successfully
 *       '200':
 *         description: Existing review updated successfully
 *       '400':
 *         description: Bad request, validation error
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '500':
 *         description: Internal server error
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
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the review to delete
 *     responses:
 *       '200':
 *         description: Review deleted successfully
 *       '400':
 *         description: Invalid review ID
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, not authorized to delete this review
 *       '404':
 *         description: Review not found
 *       '500':
 *         description: Internal server error
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
 *     security:
 *       - bearerAuth: []
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
 *       '400':
 *         description: Invalid review ID
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, admin access required
 *       '404':
 *         description: Review not found
 *       '500':
 *         description: Internal server error
 */
router.put(
  '/:id/approve',
  authenticate,
  checkRole('admin', 'edit'),
  asyncHandler(ReviewController.toggleReviewApproval)
);

module.exports = router;
