const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// Create order
router.post('/', authenticate, asyncHandler(OrderController.creatOrder));

// Get logged-in user's orders
router.get(
  '/user/:id',
  authenticate,
  asyncHandler(OrderController.getOrderByUser)
);

// Get all orders (admin)
router.get(
  '/',
  authenticate,
  isAdmin,
  asyncHandler(OrderController.getAllOrders)
);

// Get order by ID
router.get('/:id', authenticate, asyncHandler(OrderController.getOrderById));

// Update order status (admin)
router.put(
  '/:id/status',
  authenticate,
  isAdmin,
  asyncHandler(OrderController.updateOrderStatus)
);

//Get order statistics
router.get(
  '/stats',
  authenticate,
  isAdmin,
  asyncHandler(OrderController.getOrderStats)
);

// Soft delete an order (admin)
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(OrderController.deleteOrder)
);

module.exports = router;
