const Payment = require('../models/payment.model');
const Order = require('../models/order.model');
const { resSuccessObject } = require('../utils/responseObject');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const axios = require('axios');

require('dotenv').config();

// Payment controller
class PaymentController {
  // Create a new payment
  static async createPayment(req, res) {
    const { order, paymentProvider, amount, currency = 'USD' } = req.body;

    // Validation
    if (!paymentProvider || !order || !amount) {
      return res.status(400).json({
        message:
          'Missing required fields: order, paymentProvider, and amount are required',
      });
    }

    if (!['stripe', 'paystack'].includes(paymentProvider)) {
      return res.status(400).json({
        message: 'Unsupported payment provider. Use "stripe" or "paystack"',
      });
    }

    // Check for existing payment
    const existingPayment = await Payment.findOne({
      order,
      status: { $in: ['completed', 'pending'] },
    });

    if (existingPayment) {
      return res.status(409).json({
        message: 'Payment already exists for this order',
      });
    }

    // Create payment based on provider
    const paymentData = await PaymentController.createProviderPayment(
      paymentProvider,
      amount,
      currency
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

    return res.json(
      resSuccessObject({
        results: payment,
        checkoutUrl: paymentData.checkoutUrl,
      })
    );
  }

  // Helper method to create payment with different providers (fixed typo)
  static async createProviderPayment(provider, amount, currency) {
    const idempotencyKey = crypto.randomUUID();

    if (provider === 'stripe') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: { name: 'Order Payment' },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
        metadata: { idempotencyKey }, // Fixed: should be object
      });

      return {
        paymentId: session.id,
        checkoutUrl: session.url,
      };
    }

    if (provider === 'paystack') {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          amount: Math.round(amount * 100),
          currency: 'NGN',
          callback_url: `${process.env.FRONTEND_URL}/payment-success`, // Fixed: underscore
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { reference, authorization_url } = response.data.data;
      return {
        paymentId: reference,
        checkoutUrl: authorization_url,
      };
    }

    throw new Error('Unsupported payment provider');
  }

  // Process webhooks
  static async processWebhooks(req, res) {
    const { paymentProvider } = req.params;

    if (paymentProvider === 'stripe') {
      await PaymentController.handleStripeWebhook(req);
    } else if (paymentProvider === 'paystack') {
      await PaymentController.handlePaystackWebhook(req); // Fixed typo
    } else {
      return res.status(400).json({ message: 'Unknown payment provider' });
    }

    return res.status(200).json({ message: 'Webhook processed successfully' });
  }

  // Handle Stripe webhooks
  static async handleStripeWebhook(req) {
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    const session = event.data.object;
    const payment = await Payment.findOne({ paymentId: session.id });

    if (!payment) {
      throw new Error('Payment not found for session ID: ' + session.id);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await Promise.all([
          Payment.findByIdAndUpdate(payment._id, {
            status: 'completed',
            paidAt: new Date(),
            transactionDetails: JSON.stringify(session),
          }),
          Order.findByIdAndUpdate(payment.order, {
            paymentStatus: 'completed',
            orderStatus: 'processing',
          }),
        ]);
        break;

      case 'checkout.session.expired':
        await Payment.findByIdAndUpdate(payment._id, {
          status: 'failed',
          failureReason: 'Session expired',
          transactionDetails: JSON.stringify(session),
        });
        break;

      case 'charge.dispute.created':
        await Payment.findByIdAndUpdate(payment._id, {
          status: 'disputed',
          transactionDetails: JSON.stringify(session),
        });
        break;
    }
  }

  // Handle Paystack webhooks (fixed typo)
  static async handlePaystackWebhook(req) {
    // Verify webhook signature for security
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      throw new Error('Invalid webhook signature');
    }

    const { event, data } = req.body;
    const payment = await Payment.findOne({ paymentId: data.reference });

    if (!payment) {
      throw new Error('Payment not found for reference: ' + data.reference);
    }

    switch (event) {
      case 'charge.success':
        await Promise.all([
          Payment.findByIdAndUpdate(payment._id, {
            status: 'completed',
            paidAt: new Date(),
            transactionDetails: JSON.stringify(data),
          }),
          Order.findByIdAndUpdate(payment.order, {
            paymentStatus: 'completed',
            orderStatus: 'processing',
          }),
        ]);
        break;

      case 'charge.failed':
        await Payment.findByIdAndUpdate(payment._id, {
          status: 'failed',
          failureReason: data.gateway_response,
          transactionDetails: JSON.stringify(data),
        });
        break;
    }
  }

  // Get all payments
  static async getAllPayments(req, res) {
    const {
      status,
      orderId,
      paidAt,
      paymentProvider,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (orderId) filter.order = orderId; // Fixed: should be 'order' not 'orderId'
    if (paidAt) filter.paidAt = paidAt;
    if (paymentProvider) filter.paymentProvider = paymentProvider;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const payments = await Payment.find(filter) // Fixed: better variable naming
      .populate('order')
      .skip(skip)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const totalPayments = await Payment.countDocuments(filter);
    const numOfPages = Math.ceil(totalPayments / parseInt(limit));

    return res.json(
      resSuccessObject({
        results: payments,
        count: payments.length,
        totalPayments,
        numOfPages,
        currentPage: parseInt(page),
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

  // Update payment status
  static async updatePaymentStatus(req, res) {
    const { status, paidAt } = req.body;
    const validStatuses = [
      'pending',
      'completed',
      'failed',
      'refunded',
      'disputed',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        // Fixed: should be 400 not 404
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updateData = { status };
    if (paidAt) updateData.paidAt = paidAt;

    const payment = await Payment.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('order');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    return res.json(
      resSuccessObject({
        results: payment,
      })
    );
  }

  // Delete or Cancel payment
  static async deletePayment(req, res) {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' }); // Fixed message
    }

    return res.json(
      resSuccessObject({
        message: 'Payment deleted successfully',
      })
    );
  }
}

module.exports = PaymentController;
