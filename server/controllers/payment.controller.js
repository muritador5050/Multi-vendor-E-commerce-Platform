const Payment = require('../models/payment.model');

class PaymentController {
  static async createPayment(req, res) {
    const { orderId } = req.body;
    if (!orderId) throw new Error('orderId is required');

    await Payment.checkExistingPayment(orderId);

    const { paymentProvider, paymentId, amount, currency, checkoutUrl } =
      await Payment.createProviderPayment(orderId);

    const payment = await Payment.create({
      orderId,
      paymentProvider,
      paymentId,
      amount,
      currency: paymentProvider === 'paystack' ? 'NGN' : currency,
      status: 'pending',
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: { payment, checkoutUrl },
    });
  }

  static async processWebhooks(req, res) {
    let paymentProvider = req.params.paymentProvider;

    if (!paymentProvider) {
      const urlPath = req.originalUrl || req.path;
      if (urlPath.includes('/stripe')) {
        paymentProvider = 'stripe';
      } else if (urlPath.includes('/paystack')) {
        paymentProvider = 'paystack';
      }
    }

    if (!paymentProvider) {
      return res.status(400).json({
        success: false,
        message:
          'Payment provider not specified. Use /webhooks/stripe or /webhooks/paystack',
      });
    }

    const isTestMode =
      req.query.test === 'true' ||
      req.body?.test === 'payload' ||
      req.headers['x-test-webhook'] === 'true';

    if (isTestMode) {
      return res.status(200).json({
        success: true,
        message: 'Test webhook received successfully',
        provider: paymentProvider,
        timestamp: new Date().toISOString(),
      });
    }

    switch (paymentProvider.toLowerCase()) {
      case 'stripe':
        if (!req.headers['stripe-signature']) {
          return res.status(400).json({
            success: false,
            message:
              'Missing stripe-signature header. For testing, add ?test=true to URL',
            provider: paymentProvider,
          });
        }
        await Payment.handleStripeWebhook(req);
        break;

      case 'paystack':
        if (!req.headers['x-paystack-signature']) {
          return res.status(400).json({
            success: false,
            message:
              'Missing x-paystack-signature header. For testing, add ?test=true to URL',
            provider: paymentProvider,
          });
        }
        await Payment.handlePaystackWebhook(req);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: `Unsupported payment provider: ${paymentProvider}`,
        });
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      provider: paymentProvider,
      timestamp: new Date().toISOString(),
    });
  }

  static async getAllPayments(req, res) {
    const { status, order, paidAt, paymentProvider, page, limit } = req.query;

    const filters = { status, order, paidAt, paymentProvider };
    const pagination = { page, limit };

    const result = await Payment.getFilteredPayments(filters, pagination);

    res.json({
      success: true,
      message: 'Payments retrieved successfully',
      data: {
        payments: result.payments,
        pagination: result.pagination,
      },
    });
  }

  static async getPaymentById(req, res) {
    const { id } = req.params;
    const payment = await Payment.findByAnyId(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
        searchedId: id,
      });
    }

    res.json({
      success: true,
      message: 'Payment retrieved successfully',
      data: payment,
    });
  }

  static async getUserPayments(req, res) {
    const userId = req.user.id;
    const payments = await Payment.getUserPayments(userId);

    res.json({
      success: true,
      message: 'User payments retrieved successfully',
      data: payments,
    });
  }

  static async updatePaymentStatus(req, res) {
    const { status, paidAt } = req.body;

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    const updatedPayment = await payment.updatePaymentStatus(status, paidAt);
    await Payment.syncOrderStatus(updatedPayment._id);

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: updatedPayment,
    });
  }

  static async deletePayment(req, res) {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.json({
      success: true,
      message: 'Payment deleted successfully',
      data: payment,
    });
  }

  static async getPaymentAnalytics(req, res) {
    const userId = req.user.id;
    const { period } = req.query;

    const analytics = await Payment.getPaymentAnalytics(userId, period);

    res.json({
      success: true,
      message: 'Payment analytics retrieved successfully',
      data: analytics,
    });
  }
}

module.exports = PaymentController;
