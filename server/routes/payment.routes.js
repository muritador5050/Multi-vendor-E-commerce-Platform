const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/asyncHandler');
const PaymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

router.post('/webhooks/stripe', PaymentController.processWebhooks);
router.post('/webhooks/paystack', PaymentController.processWebhooks);

router.post('/', authenticate, asyncHandler(PaymentController.createPayment));

router.get(
  '/my-payments',
  authenticate,
  asyncHandler(PaymentController.getUserPayments)
);

router.get(
  '/',
  authenticate,
  checkRole('admin', 'read'),
  asyncHandler(PaymentController.getAllPayments)
);

router.get(
  '/admin/analytics',
  authenticate,
  checkRole('admin', 'read'),
  asyncHandler(PaymentController.getPaymentAnalytics)
);

router.get(
  '/:id',
  authenticate,
  checkRole('admin', 'read'),
  asyncHandler(PaymentController.getPaymentById)
);

router.patch(
  '/:id/status',
  authenticate,
  checkRole('admin', 'edit'),
  asyncHandler(PaymentController.updatePaymentStatus)
);

router.delete(
  '/:id',
  authenticate,
  checkRole('admin', 'delete'),
  asyncHandler(PaymentController.deletePayment)
);

module.exports = router;
