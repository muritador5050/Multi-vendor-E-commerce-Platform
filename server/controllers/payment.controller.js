const Payment = require('../models/payment.model');
const { resSuccessObject } = require('../utils/responseObject');

// Payment controller
class PaymentController {
  // Create a new payment
  static async createPayment(req, res) {
    const { order, paymentProvider, amount, currency } = req.body;

    // Validate payment data
    Payment.validatePaymentData(paymentProvider, order, amount);

    // Check for existing payment
    await Payment.checkExistingPayment(order);

    // Create payment with provider
    const paymentData = await Payment.createProviderPayment(
      paymentProvider,
      amount,
      currency,
      order
    );

    // Save payment to database
    const payment = await Payment.create({
      order,
      paymentProvider,
      paymentId: paymentData.paymentId,
      amount,
      currency: paymentProvider === 'paystack' ? 'NGN' : currency,
      status: 'pending',
    });

    return res.json({
      results: payment,
      checkoutUrl: paymentData.checkoutUrl,
    });
  }

  // Process webhooks
  static async processWebhooks(req, res) {
    const { provider } = req.params;

    if (provider === 'stripe') {
      await Payment.handleStripeWebhook(req);
    } else if (provider === 'paystack') {
      await Payment.handlePaystackWebhook(req);
    } else {
      return res.status(400).json({ message: 'Unknown payment provider' });
    }

    return res.status(200).json({ message: 'Webhook processed successfully' });
  }

  // Get all payments
  static async getAllPayments(req, res) {
    const { status, orderId, paidAt, paymentProvider, page, limit } = req.query;

    const filters = { status, orderId, paidAt, paymentProvider };
    const pagination = { page, limit };

    const result = await Payment.getFilteredPayments(filters, pagination);

    return res.json(
      resSuccessObject({
        results: result.payments,
        count: result.count,
        totalPayments: result.totalPayments,
        numOfPages: result.numOfPages,
        currentPage: result.currentPage,
      })
    );
  }

  // Get payment by ID
  static async getPaymentById(req, res) {
    const payment = await Payment.findById(req.params.id).populate('order');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    return res.json(resSuccessObject({ results: payment }));
  }

  // Get user's own payments
  static async getUserPayments(req, res) {
    const userId = req.user.id;
    const payments = await Payment.getUserPayments(userId);

    return res.json(
      resSuccessObject({
        message: 'User payments retrieved successfully',
        results: payments,
      })
    );
  }

  // Update payment status
  static async updatePaymentStatus(req, res) {
    const { status, paidAt } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const updatedPayment = await payment.updatePaymentStatus(status, paidAt);

    return res.json(resSuccessObject({ results: updatedPayment }));
  }

  // Delete or Cancel payment
  static async deletePayment(req, res) {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    return res.json(
      resSuccessObject({
        message: 'Payment deleted successfully',
      })
    );
  }

  // Get user's payment analytics and statistics
  static async getPaymentAnalytics(req, res) {
    const userId = req.user.id;
    const { period } = req.query;

    const analytics = await Payment.getPaymentAnalytics(userId, period);

    return res.json(
      resSuccessObject({
        message: 'User payment analytics retrieved successfully',
        results: analytics,
      })
    );
  }
}

module.exports = PaymentController;
