const CartController = require('../controllers/cart.controller');
const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/asyncHandler');
const {
  isVendor,
  authenticate,
  isAdmin,
  adminOrVendor,
} = require('../middlewares/authMiddleware');

// Apply authentication to all cart routes
router.use(authenticate);

// Add to cart and get cart
router.post('/items', asyncHandler(CartController.addToCart));
router.get('/', asyncHandler(CartController.getCart));

// Clear entire cart
router.delete('/clear', asyncHandler(CartController.clearCart));

// Update product quantity in cart
router.put('/items/:id', asyncHandler(CartController.updateProductQuantity));

// Remove specific item from cart
router.delete('/items/:id', asyncHandler(CartController.deleteCartItem));

module.exports = router;
