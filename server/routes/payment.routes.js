const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/asyncHandler');
const PaymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const requireEmailVerified = require('../middlewares/requireEmailVerified');

router.post('/webhooks/stripe', PaymentController.processWebhooks);
router.post('/webhooks/paystack', PaymentController.processWebhooks);

router.use(authenticate, requireEmailVerified);

router.post('/', asyncHandler(PaymentController.createPayment));

router.get('/my-payments', asyncHandler(PaymentController.getUserPayments));

router.get(
  '/',
  checkRole('admin', 'read'),
  asyncHandler(PaymentController.getAllPayments)
);

router.get(
  '/analytics',
  checkRole('admin', 'read'),
  asyncHandler(PaymentController.getPaymentAnalytics)
);

router.get('/:id', asyncHandler(PaymentController.getPaymentById));

router.patch(
  '/:id/status',

  checkRole('admin', 'edit'),
  asyncHandler(PaymentController.updatePaymentStatus)
);

router.delete(
  '/:id',
  checkRole('admin', 'delete'),
  asyncHandler(PaymentController.deletePayment)
);

module.exports = router;
