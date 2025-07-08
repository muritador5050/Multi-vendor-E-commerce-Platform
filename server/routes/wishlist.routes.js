const WishlistController = require('../controllers/wishlist.controller');
const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middlewares/authMiddleware');

// Apply authentication to all wishlist routes
router.use(authenticate);

/**
 * @openapi
 * /api/wishlist:
 *   post:
 *     summary: Add a product to the wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: MongoDB ObjectId of the product
 *                 example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       '201':
 *         description: Product added to wishlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product added to wishlist successfully"
 *                 data:
 *                   type: object
 *       '400':
 *         description: Invalid product ID format
 *       '404':
 *         description: Product not found
 *       '409':
 *         description: Product already in wishlist
 *       '500':
 *         description: Internal server error
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [addedAt, createdAt, updatedAt]
 *           default: addedAt
 *         description: Sort field for wishlist items
 *     responses:
 *       '200':
 *         description: Wishlist retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       '500':
 *         description: Internal server error
 */
router
  .route('/')
  .post(asyncHandler(WishlistController.addToWishlist))
  .get(asyncHandler(WishlistController.getWishlist));

/**
 * @openapi
 * /api/wishlist/count:
 *   get:
 *     summary: Get wishlist item count
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Wishlist count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 5
 *       '500':
 *         description: Internal server error
 */
router.route('/count').get(asyncHandler(WishlistController.getWishlistCount));

/**
 * @openapi
 * /api/wishlist/{productId}:
 *   delete:
 *     summary: Remove a product from the wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the product to remove
 *         example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       '200':
 *         description: Product removed from wishlist successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product removed from wishlist successfully"
 *       '400':
 *         description: Invalid product ID format
 *       '404':
 *         description: Product not found in wishlist
 *       '500':
 *         description: Internal server error
 *   get:
 *     summary: Check if a product is in the wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the product to check
 *         example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       '200':
 *         description: Wishlist status checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isInWishlist:
 *                   type: boolean
 *                   example: true
 *       '400':
 *         description: Invalid product ID format
 *       '500':
 *         description: Internal server error
 */
router
  .route('/:productId')
  .delete(asyncHandler(WishlistController.removeFromWishlist))
  .get(asyncHandler(WishlistController.checkWishlistStatus));

module.exports = router;
