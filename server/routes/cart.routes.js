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
  .get(asyncHandler(CartController.getCart));

router.delete('/clear', asyncHandler(CartController.clearCart));
router.put('/:id', asyncHandler(CartController.updateProductQuantity));
router.delete('/:id/delete', asyncHandler(CartController.deleteCartItem));

module.exports = router;
