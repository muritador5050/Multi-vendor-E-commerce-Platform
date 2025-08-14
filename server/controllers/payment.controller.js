const Payment = require('../models/payment.model');

// Payment controller
class PaymentController {
  static async createPayment(req, res) {
    try {
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
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async processWebhooks(req, res) {
    // Extract provider from URL path
    let paymentProvider = req.params.paymentProvider;

    if (!paymentProvider) {
      const urlPath = req.originalUrl || req.path;
      if (urlPath.includes('/stripe')) {
        paymentProvider = 'stripe';
      } else if (urlPath.includes('/paystack')) {
        paymentProvider = 'paystack';
      }
    }

    // Validate provider
    if (!paymentProvider) {
      return res.status(400).json({
        success: false,
        message:
          'Payment provider not specified. Use /webhooks/stripe or /webhooks/paystack',
      });
    }

    // Check for test mode
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

    try {
      // Process webhook based on provider
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

      // Success response
      res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
        provider: paymentProvider,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        `Webhook processing error (${paymentProvider}):`,
        error.message
      );
      if (
        error.message.includes('signature') ||
        error.message.includes('Invalid webhook')
      ) {
        return res.status(400).json({
          success: false,
          message: 'Webhook signature verification failed',
          error: error.message,
          provider: paymentProvider,
        });
      }
      res.status(200).json({
        success: false,
        message: 'Webhook received but processing failed',
        error: error.message,
        provider: paymentProvider,
      });
    }
  }

  static async getAllPayments(req, res) {
    try {
      const { status, order, paidAt, paymentProvider, page, limit } = req.query;

      const filters = { status, order, paidAt, paymentProvider };
      const pagination = { page, limit };

      const result = await Payment.getFilteredPayments(filters, pagination);

      return res.json({
        success: true,
        message: 'Payment retreived successfully',
        data: {
          payments: result.payments,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving payments',
        error: error.message,
      });
    }
  }

  // Get payment by ID
  static async getPaymentById(req, res) {
    try {
      const { id } = req.params;

      const payment = await Payment.findByAnyId(id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
          searchedId: id,
        });
      }

      return res.json({
        success: true,
        message: 'Payment retrieved',
        data: payment,
      });
    } catch (error) {
      console.error('Error fetching payment:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving payment',
        error: error.message,
      });
    }
  }

  // Get user's own payments
  static async getUserPayments(req, res) {
    try {
      const userId = req.user.id;
      const payments = await Payment.getUserPayments(userId);

      return res.json({
        data: {
          results: payments,
        },
      });
    } catch (error) {
      console.error('Error fetching user payments:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving user payments',
        error: error.message,
      });
    }
  }

  // Update payment status
  static async updatePaymentStatus(req, res) {
    try {
      const { status, paidAt } = req.body;

      const payment = await Payment.findById(req.params.id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        });
      }

      const updatedPayment = await payment.updatePaymentStatus(status, paidAt);

      return res.json({
        success: true,
        message: 'Payment status updated successfully',
        data: updatedPayment,
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating payment status',
        error: error.message,
      });
    }
  }

  // Delete or Cancel payment
  static async deletePayment(req, res) {
    try {
      const payment = await Payment.findByIdAndDelete(req.params.id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        });
      }

      return res.json({
        data: {
          success: true,
          message: 'Payment deleted successfully',
        },
      });
    } catch (error) {
      console.error('Error deleting payment:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting payment',
        error: error.message,
      });
    }
  }

  // Get user's payment analytics and statistics
  static async getPaymentAnalytics(req, res) {
    try {
      const userId = req.user.id;
      const { period } = req.query;

      const analytics = await Payment.getPaymentAnalytics(userId, period);

      return res.json({
        data: {
          results: analytics,
        },
      });
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving payment analytics',
        error: error.message,
      });
    }
  }
}

module.exports = PaymentController;
