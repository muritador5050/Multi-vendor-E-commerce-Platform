const Payment = require('../models/payment.model');
const Order = require('../models/order.model');
const { resSuccessObject } = require('../utils/responseObject');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
require('dotenv').config();

//Payment controller
class PaymentController {
  //Create a new payment
  static async createPayment(req, res) {
    const {
      order: orderId,
      paymentProvider,
      amount,
      currency = currency || 'USD',
      paidAt,
    } = req.body;

    if (!paymentProvider || !orderId || !amount)
      return res.status(404).json('Missing required payment fields');

    if (!['stripe', 'paypal', 'paystack'].includes(paymentProvider))
      return res.status(404).json('Unsupported payment provider');

    //Check for existing payment
    const existingPayment = await Payment.findOne({
      order: orderId,
      status: { $in: ['completed', 'pending'] },
    });
    if (existingPayment) {
      res
        .status(400)
        .json({ message: 'Payment already exists for this order' });
    }

    // Generate idempotency key
    const idempotencyKey = crypto.randomUUID();

    // Create payment with respective provider
    let paymentData = {};
    let paymentMethodDetails = {};

    if (paymentProvider === 'stripe') {
      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase(),
          metaData: { orderId, idempotencyKey },
        },
        { idempotencyKey }
      );
      paymentData = {
        paymentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      };
      paymentMethodDetails = {
        clientSecret: paymentIntent.client_secret,
        publicKey: process.env.STRIPE_PUBLIC_KEY,
      };
    }

    // Create payment record
    const payment = await Payment.create({
      order: orderId,
      paymentProvider,
      paymentId: paymentData.paymentId,
      amount,
      currency,
      status: 'pending',
      idempotencyKey,
      paymentDetails: btoa(paymentData),
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      },
    });

    res.json(
      resSuccessObject({
        results: {
          payment: {
            id: payment._id,
            amount,
            currency,
            status: payment.status,
            paymentProvider,
          },
          paymentMethodDetails,
        },
      })
    );
  }

  //Get all payments
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
    if (orderId) filter.orderId = orderId;
    if (paidAt) filter.paidAt = paidAt;
    if (paymentProvider) filter.paymentProvider = paymentProvider;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const payment = await Payment.find(filter)
      .populate('order')
      .skip(skip)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const totalPayments = await Payment.countDocuments(filter);
    const numOfPages = Math.ceil(totalPayments / parseInt(limit));

    res.json(
      resSuccessObject({
        results: payment,
        count: payment.length,
        totalPayments,
        numOfPages,
        currentPage: parseInt(page),
      })
    );
  }

  //Get payment by ID
  static async getPaymentById(req, res) {
    const payment = await Payment.findById(req.params.id).populate('order');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    res.json(resSuccessObject({ results: payment }));
  }

  //Update payment status
  static async updatePaymentStatus(req, res) {
    const { paidAt, status } = req.body;

    if (
      !status ||
      !['pending', 'completed', 'failed', 'refunded'].includes(status)
    ) {
      res.status(404).json({ message: 'Please provide a valid status' });
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        paidAt,
        status,
      },
      { new: true, runValidators: true }
    ).populate('order');

    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(
      resSuccessObject({
        results: payment,
      })
    );
  }

  //

  //Delete or Cancel payment
  static async deletePayment(req, res) {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment)
      return res.status(404).json({ message: 'Payment did not found' });

    res.json(
      resSuccessObject({
        message: 'Payment deleted successfully',
      })
    );
  }
}

module.exports = PaymentController;
