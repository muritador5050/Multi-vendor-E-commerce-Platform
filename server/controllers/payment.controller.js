const Payment = require('../models/payment.model');
const Order = require('../models/order.model');
const { resSuccessObject } = require('../utils/responseObject');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const axios = require('axios');
const { readdirSync } = require('fs');
require('dotenv').config();

//Payment controller
class PaymentController {
  //Create a new payment
  static async createPayment(req, res) {
    const { order, paymentProvider, amount, currency = 'USD' } = req.body;

    if (!paymentProvider || !order || !amount)
      return res.status(404).json('Missing required payment fields');

    //Check for existing payment
    const existingPayment = await Payment.findOne({
      order,
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

    if (paymentProvider === 'stripe') {
      const session = await stripe.checkout.sessions.create(
        {
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: currency || 'usd',
                product_data: { name: 'order payment' },
                unit_amount: amount * 100,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
        },
        { idempotencyKey }
      );
      paymentData = {
        paymentId: session.id,
        checkoutUrl: session.url,
        provider: 'stripe',
        status: 'pending',
      };
    } else if (paymentProvider === 'paystack') {
      const paystackRes = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          amount: amount * 100,
          callback_url: `${process.env.CLIENT_URL}/payment-success`,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const { reference, authorization_url } = paystackRes.data.data;
      paymentData = {
        paymentId: reference,
        checkoutUrl: authorization_url,
        provider: 'paystack',
        status: 'pending',
      };
    } else {
      return res.status(400).json({ message: 'Unsupported payment provider' });
    }

    const payment = await Payment.create({
      order,
      paymentProvider,
      paymentId: paymentData.paymentId,
      amount,
      currency: currency || 'NGN',
      status: paymentData.status,
    });

    res.json(
      resSuccessObject({
        results: payment,
        checkoutUrl: paymentData.checkoutUrl,
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

  static async processWebhook(req, res) {
    const { paymentProvider } = req.params;

    if (paymentProvider === 'stripe') {
      const sig = req.headers['stripe-signature'];
      let event;

      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      const paymentIntent = event.data.object;
      const paymentId = paymentIntent.id;
      const payment = await Payment.findById({ paymentId });

      switch (event.type) {
        case 'checkout.session.completed':
          await Payment.findOneAndUpdate(paymentId._id, {
            status: 'completed',
            paidAt: new Date(),
            transactionDetails: JSON.stringify(paymentIntent),
          });

          await Order.findOneAndUpdate(payment.order, {
            paymentStatus: 'completed',
            orderStatus: 'processing',
          });
          break;
        case 'checkout.session.failed':
          await Payment.findByIdAndUpdate(payment._id, {
            status: 'failed',
            failureReason:
              session.last_payment_error?.message || 'Payment failed',
            transactionDetails: JSON.stringify(paymentIntent),
          });
          break;
        case 'charge.refunded':
          await Payment.findByIdAndUpdate(payment._id, {
            status: 'refunded',
            refundedAt: new Date(),
            transactionDetails: JSON.stringify(paymentIntent),
          });
          break;
      }
    } else if (paymentProvider === 'paystack') {
      const { reference } = req.query;

      const paystackRes = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const paymentData = paystackRes.data.data;
      if (paymentData.status === 'success') {
        await Payment.findOneAndUpdate(
          { paymentId: reference },
          { status: 'completed', paidAt: new Date() }
        );
      }

      res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
    } else {
    }
    res.status(200).send('Webhook received');
  }
}

module.exports = PaymentController;
