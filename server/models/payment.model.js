const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const axios = require('axios');
const Order = require('./order.model');
const Cart = require('./cart.model');
const EmailService = require('../services/emailService');

const getFrontendUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return (
      process.env.FRONTEND_URL_PROD ||
      'https://multi-vendor-e-commerce-platform.vercel.app'
    );
  }
  return process.env.FRONTEND_URL || 'http://localhost:5173';
};

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
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    paymentProvider: {
      type: String,
      enum: ['stripe', 'paystack', 'card', 'bank_transfer'],
      required: true,
    },
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
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Static Methods
paymentSchema.statics.validatePaymentData = function (
  paymentProvider,
  orderId,
  amount
) {
  if (!paymentProvider || !orderId || !amount) {
    throw new Error(
      'Missing required fields: order, paymentProvider, and amount are required'
    );
  }

  if (
    !['stripe', 'paystack', 'card', 'bank_transfer'].includes(paymentProvider)
  ) {
    throw new Error('Unsupported payment provider. Use "stripe" or "paystack"');
  }
};

paymentSchema.statics.checkExistingPayment = async function (orderId) {
  const existingPayment = await this.findOne({
    orderId,
    status: { $in: ['completed', 'pending'] },
  });

  if (existingPayment) {
    throw new Error(
      `There is already a ${existingPayment.status} payment for this order`
    );
  }
};

paymentSchema.statics.createStripePayment = async function (
  orderId,
  amount,
  currency
) {
  const idempotencyKey = crypto.randomUUID();

  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  const processedCurrency = (currency || 'usd').toLowerCase();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: processedCurrency,
          product_data: { name: 'Order Payment' },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${getFrontendUrl()}/payment-success/stripe?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
    cancel_url: `${getFrontendUrl()}/payment-cancel/stripe?order_id=${orderId}&reason=user_cancelled`,
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

paymentSchema.statics.createPaystackPayment = async function (orderId, amount) {
  const idempotencyKey = crypto.randomUUID();

  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured');
  }

  const order = await Order.findById(orderId).populate('userId', 'name email');
  if (!order) {
    throw new Error('Order not found');
  }

  const amountInKobo = Math.round(amount * 100);
  if (amountInKobo < 1) {
    throw new Error('Amount too small for Paystack (minimum 0.01 NGN)');
  }

  const customerEmail = order.userId?.email || 'customer@example.com';
  const paymentReference = `order_${orderId}_${Date.now()}`;
  const paymentData = {
    email: customerEmail,
    amount: amountInKobo,
    currency: 'NGN',
    reference: paymentReference,
    callback_url: `${getFrontendUrl()}/payment-success/paystack?reference=${paymentReference}&order_id=${orderId}`,
    channels: [
      'card',
      'bank',
      'apple_pay',
      'ussd',
      'qr',
      'mobile_money',
      'bank_transfer',
      'eft',
    ],
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

paymentSchema.statics.createProviderPayment = async function (orderId) {
  const order = await Order.findById(orderId).select(
    'paymentMethod totalPrice'
  );
  if (!order) throw new Error('Order not found');

  const { paymentMethod, totalPrice } = order;
  if (totalPrice <= 0) throw new Error('Order total must be positive');

  if (paymentMethod === 'stripe') {
    const { paymentId, checkoutUrl } = await this.createStripePayment(
      orderId,
      totalPrice
    );
    return {
      paymentProvider: 'stripe',
      paymentId,
      amount: totalPrice,
      checkoutUrl,
    };
  }
  if (paymentMethod === 'paystack') {
    const { paymentId, checkoutUrl } = await this.createPaystackPayment(
      orderId,
      totalPrice
    );
    return {
      paymentProvider: 'paystack',
      paymentId,
      amount: totalPrice,
      checkoutUrl,
    };
  }
  throw new Error('Unsupported payment provider');
};

paymentSchema.statics.handleStripeWebhook = async function (req) {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    throw new Error('Missing stripe-signature header');
  }

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

  // Use database session for consistency
  const dbSession = await mongoose.startSession();

  try {
    await dbSession.withTransaction(async () => {
      let newPaymentStatus, newOrderStatus;

      switch (event.type) {
        case 'checkout.session.completed':
          newPaymentStatus = 'completed';
          newOrderStatus = 'paid';

          await this.findByIdAndUpdate(
            payment._id,
            {
              status: newPaymentStatus,
              paidAt: new Date(),
              transactionDetails: JSON.stringify(session),
            },
            { session: dbSession }
          );

          const updatedOrder = await Order.findByIdAndUpdate(
            payment.orderId,
            { orderStatus: newOrderStatus },
            { new: true, session: dbSession }
          )
            .populate('userId', 'name email')
            .populate({
              path: 'products.product',
              select: 'name price images',
            });

          await Cart.findOneAndUpdate(
            { user: updatedOrder.userId },
            { $set: { items: [] } },
            { session: dbSession }
          );

          await EmailService.sendOrderStatusUpdateEmail(updatedOrder);
          break;

        case 'checkout.session.expired':
          newPaymentStatus = 'failed';

          await this.findByIdAndUpdate(
            payment._id,
            {
              status: newPaymentStatus,
              failureReason: 'Session expired',
              transactionDetails: JSON.stringify(session),
            },
            { session: dbSession }
          );

          // CORRECTED: Sync order status
          await this.syncOrderStatus(payment._id, dbSession);
          break;

        case 'charge.dispute.created':
          newPaymentStatus = 'disputed';

          await this.findByIdAndUpdate(
            payment._id,
            {
              status: newPaymentStatus,
              transactionDetails: JSON.stringify(session),
            },
            { session: dbSession }
          );

          // CORRECTED: Handle disputed payments
          await Order.findByIdAndUpdate(
            payment.orderId,
            { orderStatus: 'on_hold' },
            { session: dbSession }
          );
          break;

        case 'payment_intent.payment_failed':
          newPaymentStatus = 'failed';

          await this.findByIdAndUpdate(
            payment._id,
            {
              status: newPaymentStatus,
              failureReason:
                session.last_payment_error?.message || 'Payment failed',
              transactionDetails: JSON.stringify(session),
            },
            { session: dbSession }
          );

          await this.syncOrderStatus(payment._id, dbSession);
          break;

        case 'payment_intent.canceled':
          newPaymentStatus = 'failed';

          await this.findByIdAndUpdate(
            payment._id,
            {
              status: newPaymentStatus,
              failureReason: 'Payment cancelled',
              transactionDetails: JSON.stringify(session),
            },
            { session: dbSession }
          );

          await this.syncOrderStatus(payment._id, dbSession);
          break;

        case 'charge.refunded':
          newPaymentStatus = 'refunded';

          await this.findByIdAndUpdate(
            payment._id,
            {
              status: newPaymentStatus,
              transactionDetails: JSON.stringify(session),
            },
            { session: dbSession }
          );

          await Order.findByIdAndUpdate(
            payment.orderId,
            { orderStatus: 'refunded' },
            { session: dbSession }
          );
          break;

        case 'invoice.payment_failed':
          newPaymentStatus = 'failed';

          await this.findByIdAndUpdate(
            payment._id,
            {
              status: newPaymentStatus,
              failureReason: 'Invoice payment failed',
              transactionDetails: JSON.stringify(session),
            },
            { session: dbSession }
          );

          await this.syncOrderStatus(payment._id, dbSession);
          break;

        default:
          console.log('Unhandled Stripe event type:', event.type);
      }
    });
  } catch (dbError) {
    throw new Error(`Failed to update payment status: ${dbError.message}`);
  } finally {
    await dbSession.endSession();
  }
};

paymentSchema.statics.handlePaystackWebhook = async function (req) {
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

  const session_db = await mongoose.startSession();

  try {
    await session_db.withTransaction(async () => {
      switch (event) {
        case 'charge.success':
          console.log(
            'Processing successful Paystack payment for:',
            payment._id
          );

          await this.findByIdAndUpdate(
            payment._id,
            {
              status: 'completed',
              paidAt: new Date(),
              transactionDetails: JSON.stringify(data),
            },
            { session: session_db }
          );

          const updatedOrder = await Order.findByIdAndUpdate(
            payment.orderId,
            { orderStatus: 'paid' },
            { new: true, session: session_db }
          )
            .populate('userId', 'name email')
            .populate({
              path: 'products.product',
              select: 'name price images',
            });

          await Cart.findOneAndUpdate(
            { user: updatedOrder.userId },
            { $set: { items: [] } },
            { session: session_db }
          );

          await EmailService.sendOrderStatusUpdateEmail(updatedOrder);
          break;

        case 'charge.failed':
          await this.findByIdAndUpdate(
            payment._id,
            {
              status: 'failed',
              failureReason: data.gateway_response || 'Payment failed',
              transactionDetails: JSON.stringify(data),
            },
            { session: session_db }
          );

          await this.syncOrderStatus(payment._id, session_db);
          console.log(`Payment ${payment._id} failed`);
          break;
        case 'transfer.success':
          // Handle successful refund/transfer
          await this.findByIdAndUpdate(
            payment._id,
            {
              status: 'refunded',
              transactionDetails: JSON.stringify(data),
            },
            { session: session_db }
          );

          await Order.findByIdAndUpdate(
            payment.orderId,
            { orderStatus: 'refunded' },
            { session: session_db }
          );
          break;

        case 'dispute.create':
          await this.findByIdAndUpdate(
            payment._id,
            {
              status: 'disputed',
              transactionDetails: JSON.stringify(data),
            },
            { session: session_db }
          );

          await Order.findByIdAndUpdate(
            payment.orderId,
            { orderStatus: 'on_hold' },
            { session: session_db }
          );
          break;

        case 'dispute.resolve':
          // Restore payment status based on dispute resolution
          const disputeStatus =
            data.status === 'resolved' ? 'completed' : 'failed';

          await this.findByIdAndUpdate(
            payment._id,
            {
              status: disputeStatus,
              transactionDetails: JSON.stringify(data),
            },
            { session: session_db }
          );

          await this.syncOrderStatus(payment._id, session_db);
          break;

        default:
          console.log('Unhandled Paystack event type:', event);
      }
    });
  } catch (dbError) {
    console.error('Database update error:', dbError);
    throw new Error(`Failed to update payment status: ${dbError.message}`);
  } finally {
    await session_db.endSession();
  }
};

paymentSchema.statics.findByAnyId = async function (identifier) {
  let payment;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    payment = await this.findById(identifier).populate('orderId');
  }

  if (!payment) {
    payment = await this.findOne({
      $or: [{ paymentId: identifier }],
    }).populate('orderId');
  }

  return payment;
};

paymentSchema.statics.getFilteredPayments = async function (
  filters,
  pagination
) {
  const { status, orderId, paidAt, paymentProvider } = filters;
  const { page = 1, limit = 10 } = pagination;

  const filter = {};
  if (status) filter.status = status;
  if (orderId) filter.orderId = orderId;
  if (paidAt) filter.paidAt = paidAt;
  if (paymentProvider) filter.paymentProvider = paymentProvider;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [payments, totalPayments] = await Promise.all([
    this.find(filter)
      .populate('orderId')
      .populate('userId', 'name email')
      .skip(skip)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit)),
    this.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalPayments / parseInt(limit));

  return {
    payments,
    pagination: {
      total: totalPayments,
      page: parseInt(page),
      limit,
      totalPages,
    },
  };
};

paymentSchema.statics.getUserPayments = async function (userId) {
  return await this.find({ userId })
    .populate([
      { path: 'orderId', select: 'orderNumber totalAmount' },
      { path: 'userId', select: 'name email' },
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
    userId: new mongoose.Types.ObjectId(userId),
    createdAt: { $gte: startDate },
  };

  const [
    overallStats,
    statusBreakdown,
    monthlyTrends,
    paymentMethodBreakdown,
    recentTransactions,
  ] = await Promise.all([
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

    this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$paymentProvider',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          paymentProvider: '$_id',
          count: 1,
          totalAmount: 1,
          avgAmount: { $round: ['$avgAmount', 2] },
        },
      },
    ]),

    this.find(matchStage)
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('amount status paymentProvider createdAt orderId paymentId')
      .lean(),
  ]);

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

paymentSchema.methods.updatePaymentStatus = async function (status, paidAt) {
  const Payment = this.constructor;
  Payment.validateStatusUpdate(status);

  const updateData = { status };
  if (paidAt) updateData.paidAt = paidAt;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const updatedPayment = await Payment.findByIdAndUpdate(
        this._id,
        updateData,
        { new: true, runValidators: true, session }
      ).populate('orderId');

      await Payment.syncOrderStatus(this._id, session);

      if (status === 'completed') {
        const order = await Order.findById(updatedPayment.orderId)
          .populate('userId', 'name email')
          .populate({
            path: 'products.product',
            select: 'name price images',
          })
          .session(session);

        await EmailService.sendOrderStatusUpdateEmail(order);
      }

      return updatedPayment;
    });
  } finally {
    await session.endSession();
  }
};

paymentSchema.statics.syncOrderStatus = async function (
  paymentId,
  session = null
) {
  const payment = await this.findById(paymentId);
  if (!payment) return;

  const order = await Order.findById(payment.orderId);
  if (!order) return;

  let newOrderStatus;

  switch (payment.status) {
    case 'completed':
      if (order.orderStatus === 'pending') {
        newOrderStatus = 'paid';
      }
      break;

    case 'failed':
      if (['pending', 'awaiting_payment'].includes(order.orderStatus)) {
        newOrderStatus = 'cancelled';
      }
      break;

    case 'refunded':
      if (['delivered', 'shipped'].includes(order.orderStatus)) {
        newOrderStatus = 'returned';
      } else {
        newOrderStatus = 'cancelled';
      }
      break;

    case 'disputed':
      if (!['cancelled', 'returned', 'delivered'].includes(order.orderStatus)) {
        newOrderStatus = 'on_hold';
      }
      break;

    default:
      return;
  }

  if (newOrderStatus && newOrderStatus !== order.orderStatus) {
    const updateOptions = { new: true };
    if (session) updateOptions.session = session;

    await Order.findByIdAndUpdate(
      payment.orderId,
      { orderStatus: newOrderStatus },
      updateOptions
    );

    console.log(
      `Order ${payment.orderId} status synced: ${order.orderStatus} → ${newOrderStatus}`
    );
  }
};

// Get payments for vendor's products
paymentSchema.statics.getVendorPayments = async function (
  vendorId,
  queryParams = {}
) {
  const {
    page = 1,
    limit = 10,
    status,
    paymentProvider,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    startDate,
    endDate,
  } = queryParams;

  const matchStage = {};

  if (status) matchStage.status = status;
  if (paymentProvider) matchStage.paymentProvider = paymentProvider;

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'orders',
        localField: 'orderId',
        foreignField: '_id',
        as: 'order',
      },
    },
    { $unwind: '$order' },
    { $unwind: '$order.products' },
    {
      $lookup: {
        from: 'products',
        localField: 'order.products.product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    { $unwind: '$productInfo' },
    {
      $match: {
        'productInfo.vendor': new mongoose.Types.ObjectId(vendorId),
      },
    },
    {
      $group: {
        _id: '$_id',
        orderId: { $first: '$orderId' },
        paymentProvider: { $first: '$paymentProvider' },
        paymentId: { $first: '$paymentId' },
        status: { $first: '$status' },
        paidAt: { $first: '$paidAt' },
        createdAt: { $first: '$createdAt' },
        updatedAt: { $first: '$updatedAt' },
        userId: { $first: '$userId' },
        vendorProducts: {
          $push: {
            product: '$order.products.product',
            productName: '$productInfo.name',
            quantity: '$order.products.quantity',
            price: '$order.products.price',
            total: {
              $multiply: ['$order.products.quantity', '$order.products.price'],
            },
          },
        },
        vendorAmount: {
          $sum: {
            $multiply: ['$order.products.quantity', '$order.products.price'],
          },
        },
        totalPaymentAmount: { $first: '$amount' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userInfo',
      },
    },
    { $unwind: '$userInfo' },
    {
      $project: {
        orderId: 1,
        paymentProvider: 1,
        paymentId: 1,
        status: 1,
        paidAt: 1,
        createdAt: 1,
        updatedAt: 1,
        userName: '$userInfo.name',
        userEmail: '$userInfo.email',
        vendorProducts: 1,
        vendorAmount: 1,
        totalPaymentAmount: 1,
        vendorPercentage: {
          $multiply: [
            { $divide: ['$vendorAmount', '$totalPaymentAmount'] },
            100,
          ],
        },
      },
    },
    { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
    { $skip: (parseInt(page) - 1) * parseInt(limit) },
    { $limit: parseInt(limit) },
  ];

  const countPipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: 'orders',
        localField: 'orderId',
        foreignField: '_id',
        as: 'order',
      },
    },
    { $unwind: '$order' },
    { $unwind: '$order.products' },
    {
      $lookup: {
        from: 'products',
        localField: 'order.products.product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    { $unwind: '$productInfo' },
    {
      $match: {
        'productInfo.vendor': new mongoose.Types.ObjectId(vendorId),
      },
    },
    {
      $group: {
        _id: '$_id',
      },
    },
    { $count: 'total' },
  ];

  const [payments, totalResult] = await Promise.all([
    this.aggregate(pipeline),
    this.aggregate(countPipeline),
  ]);

  const total = totalResult[0]?.total || 0;

  return {
    payments,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalPayments: total,
      hasNextPage:
        (parseInt(page) - 1) * parseInt(limit) + payments.length < total,
      hasPrevPage: parseInt(page) > 1,
    },
  };
};

module.exports = mongoose.model('Payment', paymentSchema);
