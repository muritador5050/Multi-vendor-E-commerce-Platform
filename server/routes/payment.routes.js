const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/asyncHandler');
const PaymentController = require('../controllers/payment.controller');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// Payment CRUD routes
router.post('/', asyncHandler(PaymentController.createPayment));
router.get('/', asyncHandler(PaymentController.getAllPayments));
router.get('/:id', asyncHandler(PaymentController.getPaymentById));
router.patch(
  '/:id/status',
  asyncHandler(PaymentController.updatePaymentStatus)
);
router.delete('/:id', asyncHandler(PaymentController.deletePayment));

// Webhook routes (these should NOT use asyncHandler as they need different error handling)
router.post(
  '/webhooks/:paymentProvider',
  express.raw({ type: 'application/json' }),
  PaymentController.processWebhooks
);

module.exports = router;
