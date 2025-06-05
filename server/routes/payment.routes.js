const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/asyncHandler');
const PaymentController = require('../controllers/payment.controller');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// Webhook endpoint for payment providers (e.g., Stripe, PayPal)
router.post(
  '/webhooks/:paymentProvider',
  express.raw({ type: 'application/json' }),
  PaymentController.processWebhooks
);

/**
 * @openapi
 * /payments:
 *   post:
 *     summary: Create a new payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *               currency:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, paypal, bank_transfer]
 *     responses:
 *       '201':
 *         description: Payment created successfully
 *       '400':
 *         description: Bad request, invalid input data
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, user does not have permission to create a payment
 *       '500':
 *         description: Internal server error
 */
router.post('/', authenticate, asyncHandler(PaymentController.createPayment));

/**
 * @openapi
 * /payments/my-payments:
 *   get:
 *     summary: Get all payments made by the authenticated user
 *     tags: [Payments]
 *     responses:
 *       '200':
 *         description: List of payments made by the user
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, user does not have permission to view payments
 */
router.get(
  '/my-payments',
  authenticate,
  asyncHandler(PaymentController.getUserPayments)
);

/**
 * @openapi
 * /payments/{id}:
 *   get:
 *     summary: Get payment details by ID
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment to retrieve
 *     responses:
 *       '200':
 *         description: Payment details retrieved successfully
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, user does not have permission to view this payment
 *       '404':
 *         description: Payment not found
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(PaymentController.getPaymentById)
);

/**
 * @openapi
 * /payments:
 *   get:
 *     summary: Get all payments (admin only)
 *     tags: [Payments]
 *     responses:
 *       '200':
 *         description: List of all payments
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, user does not have permission to view all payments
 */
router.get(
  '/',
  authenticate,
  isAdmin,
  asyncHandler(PaymentController.getAllPayments)
);

/**
 * @openapi
 * /payments/{id}/status:
 *   put:
 *     summary: Update payment status (admin only)
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed, refunded]
 *     responses:
 *       '200':
 *         description: Payment status updated successfully
 *       '400':
 *         description: Bad request, invalid input data
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, user does not have permission to update payment status
 */
router.put(
  '/:id/status',
  authenticate,
  isAdmin,
  asyncHandler(PaymentController.updatePaymentStatus)
);

/**
 * @openapi
 * /payments/{id}:
 *   delete:
 *     summary: Delete a payment (admin only)
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the payment to delete
 *     responses:
 *       '204':
 *         description: Payment deleted successfully
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, user does not have permission to delete this payment
 */
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(PaymentController.deletePayment)
);

/**
 * @openapi
 * /admin/analytics:
 *   get:
 *     summary: Get payment analytics (admin only)
 *     tags: [Payments]
 *     responses:
 *       '200':
 *         description: Payment analytics retrieved successfully
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, user does not have permission to view analytics
 */
router.get(
  '/admin/analytics',
  authenticate,
  isAdmin,
  asyncHandler(PaymentController.getPaymentAnalytics)
);

module.exports = router;
