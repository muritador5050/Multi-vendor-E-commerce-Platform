const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// Create order (authenticated users)
// Get all orders (admin only)
router
  .route('/')
  .post(authenticate, asyncHandler(OrderController.creatOrder))
  .get(authenticate, isAdmin, asyncHandler(OrderController.getAllOrders));

// Get order statistics (admin only)
router.get(
  '/stats',
  authenticate,
  isAdmin,
  asyncHandler(OrderController.getOrderStats)
);

// Update order status (admin only)
router.put(
  '/:id/status',
  authenticate,
  isAdmin,
  asyncHandler(OrderController.updateOrderStatus)
);

// Get single order (authenticated users - with ownership check in controller)
// Delete order (admin only)
router
  .route('/:id')
  .get(authenticate, asyncHandler(OrderController.getOrderById))
  .delete(authenticate, isAdmin, asyncHandler(OrderController.deleteOrder));

module.exports = router;
