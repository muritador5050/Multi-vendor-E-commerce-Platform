const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/asyncHandler');
const PaymentController = require('../controllers/payment.controller');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// Payment provider webhooks - Stripe, PayPal, etc. call these endpoints
router.post(
  '/webhooks/:paymentProvider',
  express.raw({ type: 'application/json' }),
  PaymentController.processWebhooks
);

// Create payment - Only authenticated users can initiate payments
router.post('/', authenticate, asyncHandler(PaymentController.createPayment));

// Note: This should be implemented with user filtering in the controller
router.get(
  '/my-payments',
  authenticate,
  asyncHandler(PaymentController.getUserPayments)
);

// Note: Controller should verify ownership
router.get(
  '/:id',
  authenticate,
  asyncHandler(PaymentController.getPaymentById)
);

// Get all payments - Only admins should see all payments
router.get(
  '/',
  authenticate,
  isAdmin,
  asyncHandler(PaymentController.getAllPayments)
);

// Update payment status - Only admins can manually update payment status
router.put(
  '/:id/status',
  authenticate,
  isAdmin,
  asyncHandler(PaymentController.updatePaymentStatus)
);

// Delete payment - Only admins can delete payments (should be rare)
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(PaymentController.deletePayment)
);

// Admin analytics/reports routes
router.get(
  '/admin/analytics',
  authenticate,
  isAdmin,
  asyncHandler(PaymentController.getPaymentAnalytics)
);

module.exports = router;
