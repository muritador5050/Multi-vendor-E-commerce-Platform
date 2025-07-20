const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const axios = require('axios');

/**
 * @openapi
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         order:
 *           type: string
 *           format: uuid
 *         paymentProvider:
 *           type: string
 *         paymentId:
 *           type: string
 *         amount:
 *           type: number
 *           format: float
 *         currency:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, refunded, disputed]
 */
const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    paymentProvider: { type: String, required: true },
    paymentId: { type: String, required: true, unique: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'disputed'],
      default: 'pending',
    },
    paidAt: Date,
    failureReason: String,
    transactionDetails: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Static Methods
paymentSchema.statics.validatePaymentData = function (
  paymentProvider,
  order,
  amount
) {
  if (!paymentProvider || !order || !amount) {
    throw new Error(
      'Missing required fields: order, paymentProvider, and amount are required'
    );
  }

  if (!['stripe', 'paystack'].includes(paymentProvider)) {
    throw new Error('Unsupported payment provider. Use "stripe" or "paystack"');
  }
};

paymentSchema.statics.checkExistingPayment = async function (orderId) {
  const existingPayment = await this.findOne({
    order: orderId,
    status: { $in: ['completed', 'pending'] },
  });

  if (existingPayment) {
    throw new Error('Payment already exists for this order');
  }
};

paymentSchema.statics.createStripePayment = async function (
  amount,
  currency,
  orderId
) {
  const Order = require('./order.model');
  const idempotencyKey = crypto.randomUUID();

  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

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
    metadata: {
      idempotencyKey,
      orderId: orderId.toString(),
    },
  });

  return {
    paymentId: session.id,
    checkoutUrl: session.url,
  };
};

paymentSchema.statics.createPaystackPayment = async function (amount, orderId) {
  const Order = require('./order.model');
  const idempotencyKey = crypto.randomUUID();

  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  const amountInKobo = Math.round(amount * 100);
  if (amountInKobo < 1) {
    throw new Error('Amount too small for Paystack (minimum 0.01 NGN)');
  }

  const customerEmail =
    order.customerEmail || order.user?.email || 'customer@example.com';

  const paymentData = {
    amount: amountInKobo,
    currency: 'NGN',
    email: customerEmail,
    reference: `order_${orderId}_${Date.now()}`,
    callback_url: `${process.env.FRONTEND_URL}/payment-success`,
    metadata: {
      orderId: orderId.toString(),
      idempotencyKey,
    },
  };

  const response = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    paymentData,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  );

  if (!response.data.status) {
    throw new Error(`Paystack API error: ${response.data.message}`);
  }

  const { reference, authorization_url } = response.data.data;

  if (!authorization_url) {
    throw new Error('Paystack did not return checkout URL');
  }

  return {
    paymentId: reference,
    checkoutUrl: authorization_url,
  };
};

paymentSchema.statics.createProviderPayment = async function (
  provider,
  amount,
  currency,
  orderId
) {
  if (provider === 'stripe') {
    return await this.createStripePayment(amount, currency, orderId);
  }

  if (provider === 'paystack') {
    return await this.createPaystackPayment(amount, orderId);
  }

  throw new Error('Unsupported payment provider');
};

paymentSchema.statics.handleStripeWebhook = async function (req) {
  const Order = require('./order.model');
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  const session = event.data.object;
  const payment = await this.findOne({ paymentId: session.id });

  if (!payment) {
    throw new Error('Payment not found for session ID: ' + session.id);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await Promise.all([
        this.findByIdAndUpdate(payment._id, {
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
      await this.findByIdAndUpdate(payment._id, {
        status: 'failed',
        failureReason: 'Session expired',
        transactionDetails: JSON.stringify(session),
      });
      break;

    case 'charge.dispute.created':
      await this.findByIdAndUpdate(payment._id, {
        status: 'disputed',
        transactionDetails: JSON.stringify(session),
      });
      break;
  }
};

paymentSchema.statics.handlePaystackWebhook = async function (req) {
  const Order = require('./order.model');
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    throw new Error('Invalid webhook signature');
  }

  const { event, data } = req.body;
  const payment = await this.findOne({ paymentId: data.reference });

  if (!payment) {
    throw new Error('Payment not found for reference: ' + data.reference);
  }

  switch (event) {
    case 'charge.success':
      await Promise.all([
        this.findByIdAndUpdate(payment._id, {
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
      await this.findByIdAndUpdate(payment._id, {
        status: 'failed',
        failureReason: data.gateway_response,
        transactionDetails: JSON.stringify(data),
      });
      break;
  }
};

paymentSchema.statics.getFilteredPayments = async function (
  filters,
  pagination
) {
  const { status, orderId, paidAt, paymentProvider } = filters;
  const { page = 1, limit = 10 } = pagination;

  const filter = {};
  if (status) filter.status = status;
  if (orderId) filter.order = orderId;
  if (paidAt) filter.paidAt = paidAt;
  if (paymentProvider) filter.paymentProvider = paymentProvider;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [payments, totalPayments] = await Promise.all([
    this.find(filter)
      .populate('order')
      .skip(skip)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit)),
    this.countDocuments(filter),
  ]);

  const numOfPages = Math.ceil(totalPayments / parseInt(limit));

  return {
    payments,
    totalPayments,
    numOfPages,
    currentPage: parseInt(page),
    count: payments.length,
  };
};

paymentSchema.statics.getUserPayments = async function (userId) {
  return await this.find({ user: userId })
    .populate([
      { path: 'order', select: 'orderNumber totalAmount' },
      { path: 'user', select: 'name email' },
    ])
    .sort({ createdAt: -1 })
    .lean();
};

paymentSchema.statics.validateStatusUpdate = function (status) {
  const validStatuses = [
    'pending',
    'completed',
    'failed',
    'refunded',
    'disputed',
  ];

  if (!status || !validStatuses.includes(status)) {
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    );
  }
};

paymentSchema.statics.getPaymentAnalytics = async function (
  userId,
  period = '12months'
) {
  const now = new Date();
  let startDate;

  switch (period) {
    case '7days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30days':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '3months':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '6months':
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    case '12months':
    default:
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
  }

  const matchStage = {
    user: new mongoose.Types.ObjectId(userId),
    createdAt: { $gte: startDate },
  };

  const [
    overallStats,
    statusBreakdown,
    monthlyTrends,
    paymentMethodBreakdown,
    recentTransactions,
  ] = await Promise.all([
    // Overall statistics
    this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalTransactions: { $sum: 1 },
          avgTransactionAmount: { $avg: '$amount' },
          maxTransactionAmount: { $max: '$amount' },
          minTransactionAmount: { $min: '$amount' },
          successfulPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
        },
      },
    ]),

    // Payment status breakdown
    this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { count: -1 } },
    ]),

    // Monthly payment trends
    this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          totalAmount: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          avgAmount: { $avg: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          monthName: {
            $arrayElemAt: [
              [
                '',
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              '$_id.month',
            ],
          },
          totalAmount: 1,
          transactionCount: 1,
          avgAmount: { $round: ['$avgAmount', 2] },
        },
      },
    ]),

    // Payment method breakdown
    this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          paymentMethod: '$_id',
          count: 1,
          totalAmount: 1,
          avgAmount: { $round: ['$avgAmount', 2] },
          percentage: {
            $multiply: [{ $divide: ['$count', { $sum: '$count' }] }, 100],
          },
        },
      },
    ]),

    // Recent transactions
    this.find(matchStage)
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('amount status paymentMethod createdAt order transactionId')
      .lean(),
  ]);

  // Process overall stats
  const stats = overallStats[0] || {
    totalAmount: 0,
    totalTransactions: 0,
    avgTransactionAmount: 0,
    maxTransactionAmount: 0,
    minTransactionAmount: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
  };

  // Calculate success rate
  const successRate =
    stats.totalTransactions > 0
      ? ((stats.successfulPayments / stats.totalTransactions) * 100).toFixed(2)
      : 0;

  return {
    period,
    dateRange: { startDate, endDate: now },
    overview: {
      totalSpent: stats.totalAmount,
      totalTransactions: stats.totalTransactions,
      averageTransactionAmount:
        Math.round(stats.avgTransactionAmount * 100) / 100,
      largestTransaction: stats.maxTransactionAmount,
      smallestTransaction: stats.minTransactionAmount,
      successRate: `${successRate}%`,
    },
    paymentCounts: {
      successful: stats.successfulPayments,
      failed: stats.failedPayments,
      pending: stats.pendingPayments,
    },
    statusBreakdown,
    monthlyTrends,
    paymentMethodBreakdown,
    recentTransactions,
  };
};

// Instance Methods
paymentSchema.methods.updatePaymentStatus = async function (status, paidAt) {
  const Payment = this.constructor;
  Payment.validateStatusUpdate(status);

  const updateData = { status };
  if (paidAt) updateData.paidAt = paidAt;

  return await Payment.findByIdAndUpdate(this._id, updateData, {
    new: true,
    runValidators: true,
  }).populate('order');
};

module.exports = mongoose.model('Payment', paymentSchema);
