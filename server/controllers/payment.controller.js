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
    try {
      const { paymentProvider } = req.params;

      if (paymentProvider === 'stripe') {
        await Payment.handleStripeWebhook(req);
      } else if (paymentProvider === 'paystack') {
        await Payment.handlePaystackWebhook(req);
      } else {
        console.log('Unsupported payment provider:', paymentProvider);
        return res.status(400).json({ error: 'Unsupported payment provider' });
      }

      res.status(200).json({ received: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get all payments
  static async getAllPayments(req, res) {
    try {
      const { status, order, paidAt, paymentProvider, page, limit } = req.query;

      const filters = { status, order, paidAt, paymentProvider };
      const pagination = { page, limit };

      const result = await Payment.getFilteredPayments(filters, pagination);

      return res.json({
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
        data: {
          results: updatedPayment,
        },
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
