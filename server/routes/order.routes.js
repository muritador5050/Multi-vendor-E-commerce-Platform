const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// Create order
router
  .route('/')
  .post(authenticate, asyncHandler(OrderController.creatOrder))
  .get(authenticate, isAdmin, asyncHandler(OrderController.getAllOrders));

//Get order statistics
router.get(
  '/stats',
  authenticate,
  isAdmin,
  asyncHandler(OrderController.getOrderStats)
);
// Get logged-in user's orders
router.get(
  '/users/:id',
  authenticate,
  asyncHandler(OrderController.getOrderByUser)
);
// Update order status (admin)
router.put(
  '/:id/status',
  authenticate,
  isAdmin,
  asyncHandler(OrderController.updateOrderStatus)
);

// Get order by ID
router
  .route('/:id')
  .get(authenticate, asyncHandler(OrderController.getOrderById))
  .delete(authenticate, isAdmin, asyncHandler(OrderController.deleteOrder));

module.exports = router;
