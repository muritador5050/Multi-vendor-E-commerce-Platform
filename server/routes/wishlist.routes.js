const WishlistController = require('../controllers/wishlist.controller');
const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middlewares/authMiddleware');
router.use(authenticate);
/**
 * @openapi
 * /api/wishlist:
 *   post:
 *     summary: Add a product to the wishlist
 *     tags: [Wishlist]
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
 *     responses:
 *       '201':
 *         description: Product added to wishlist successfully
 */
router
  .route('/')
  .post(asyncHandler(WishlistController.addToWishlist))
  .get(asyncHandler(WishlistController.getWishlist));

router
  .route('/:productId')
  .delete(asyncHandler(WishlistController.removeFromWishlist));

module.exports = router;
