const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/asyncHandler');
const PaymentController = require('../controllers/payment.controller');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

//Create payment
router.post('/', authenticate, asyncHandler(PaymentController.createPayment));

//Get all payments
router.get(
  '/',
  authenticate,
  isAdmin,
  asyncHandler(PaymentController.getAllPayments)
);

//Get a single payment
router.get(
  '/:id',
  authenticate,
  asyncHandler(PaymentController.getPaymentById)
);

//Update payment status
router.put(
  '/:id/status',
  authenticate,
  isAdmin,
  asyncHandler(PaymentController.updatePaymentStatus)
);

//Delete payment
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(PaymentController.deletePayment)
);

module.exports = router;
