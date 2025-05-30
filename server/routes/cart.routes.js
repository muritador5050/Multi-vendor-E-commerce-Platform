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

router.use(authenticate);
//Routes
router
  .route('/')
  .post(asyncHandler(CartController.addToCart))
  .get(isAdmin, CartController.getCart);

router.delete('/clear', isAdmin, asyncHandler(CartController.clearCart));
router.put('/:id', asyncHandler(CartController.updateCartItem));
router.delete('/:id', asyncHandler(CartController.removeFromCart));
