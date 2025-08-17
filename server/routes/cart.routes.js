const CartController = require('../controllers/cart.controller');
const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middlewares/authMiddleware');

router.use(authenticate);

/**
 * @openapi
 * /api/cart:
 *   get:
 *     summary: Get the current user's cart
 *     tags: [Cart]
 *     responses:
 *       '200':
 *         description: The user's cart details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: string
 *                   format: uuid
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: string
 *                         format: uuid
 *                       quantity:
 *                         type: integer
 */
router
  .route('/items')
  .post(asyncHandler(CartController.addToCart))
  .get(asyncHandler(CartController.getCart));

/**
 * @openapi
 * /api/cart/clear:
 *   delete:
 *     summary: Clear the current user's cart
 *     tags: [Cart]
 *     responses:
 *       '204':
 *         description: Cart cleared successfully
 */
router.delete('/clear', asyncHandler(CartController.clearCart));

/**
 * @openapi
 * /api/cart/items/{id}:
 *   put:
 *     summary: Update the quantity of a specific item in the cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the cart item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       '200':
 *         description: The updated cart item details
 */
router.patch('/items/:id', asyncHandler(CartController.updateProductQuantity));

/**
 * @openapi
 * /api/cart/items/{id}:
 *   delete:
 *     summary: Remove a specific item from the cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the cart item to remove
 *     responses:
 *       '204':
 *         description: Item removed from cart successfully
 */
router.delete('/items/:id', asyncHandler(CartController.deleteCartItem));

module.exports = router;
