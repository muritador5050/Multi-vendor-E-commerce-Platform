const mongoose = require('mongoose');
const User = require('./user.model');
const EmailService = require('../services/emailService');

/**
 * @openapi
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           format: uuid
 *         products:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               price:
 *                 type: number
 *                 minimum: 0
 *         shippingAddress:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zipCode:
 *               type: string
 *             country:
 *               type: string
 *         billingAddress:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zipCode:
 *               type: string
 *             country:
 *               type: string
 *         useSameAddress:
 *           type: boolean
 *           description: Indicates if billing address is same as shipping address
 *           default: true
 *         paymentMethod:
 *           type: string
 *           description: Payment method used for the order (e.g., Stripe, PayPal, COD)
 *         orderStatus:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled, returned]
 *           default: pending
 *         totalPrice:
 *           type: number
 *           minimum: 0
 *         shippingCost:
 *           type: number
 *           minimum: 0
 *         trackingNumber:
 *           type: string
 *         estimatedDelivery:
 *           type: string
 *           format: date-time
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *         isDeleted:
 *           type: boolean
 *           default: false
 */
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    useSameAddress: {
      type: Boolean,
      default: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['stripe', 'paystack', 'card', 'bank_transfer'],
    },
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'returned',
      ],
      default: 'pending',
    },
    totalPrice: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    trackingNumber: { type: String, default: '' },
    estimatedDelivery: Date,
    deliveredAt: Date,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, orderStatus: 1 });
orderSchema.index({ trackingNumber: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ isDeleted: 1 });

orderSchema.statics.validateOrderData = function (orderData) {
  const { products, paymentMethod, shippingAddress } = orderData;

  if (!products || !paymentMethod || !shippingAddress) {
    throw new Error('Required fields:products, paymentMethod, shippingAddress');
  }

  if (!products || products.length === 0) {
    throw new Error('No products in the order');
  }

  for (const item of products) {
    if (!item.product || !item.quantity) {
      throw new Error('Each product must have product ID and quantity');
    }
  }

  if (orderData.useSameAddress === false && !orderData.billingAddress) {
    throw new Error('Billing address is required when not using same address');
  }
};

orderSchema.statics.createNewOrder = async function (orderData) {
  this.validateOrderData(orderData);

  if (orderData.useSameAddress) {
    orderData.billingAddress = { ...orderData.shippingAddress };
  }

  const calculatedTotal =
    orderData.products.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ) + (orderData.shippingCost || 0);

  const order = await this.create({
    ...orderData,
    totalPrice: calculatedTotal,
    shippingCost: orderData.shippingCost || 0,
  });

  return await order.populate([
    { path: 'userId', select: 'name email' },
    { path: 'products.product', select: 'name' },
  ]);
};

orderSchema.statics.getFilteredOrders = async function (queryParams) {
  const {
    page = 1,
    limit = 10,
    orderStatus,
    paymentStatus,
    userId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    startDate,
    endDate,
    search,
  } = queryParams;

  const filter = { isDeleted: false };

  if (orderStatus) filter.orderStatus = orderStatus;
  if (userId) filter.userId = userId;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  if (search) {
    const searchRegex = { $regex: search.trim(), $options: 'i' };

    const matchingUsers = await User.find({
      $or: [{ name: searchRegex }, { email: searchRegex }],
    }).lean();

    filter.$or = [
      { paymentMethod: searchRegex },
      { trackingNumber: searchRegex },
      { 'shippingAddress.city': searchRegex },
      { 'shippingAddress.state': searchRegex },
      { 'billingAddress.city': searchRegex },
      { 'billingAddress.state': searchRegex },
    ];

    if (matchingUsers.length > 0) {
      filter.$or.push({
        userId: { $in: matchingUsers.map((u) => u._id) },
      });
    }

    if (search.match(/^[0-9a-fA-F]{24}$/)) {
      filter.$or.push({ _id: search });
    }

    if (search.toLowerCase() === 'true' || search.toLowerCase() === 'false') {
      filter.$or.push({
        useSameAddress: search.toLowerCase() === 'true',
      });
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  let orders, total;

  if (paymentStatus) {
    // If paymentStatus filter is needed, use aggregation
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'orderId',
          as: 'payment',
        },
      },
      {
        $match: {
          'payment.status': paymentStatus,
        },
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ];

    const countPipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'orderId',
          as: 'payment',
        },
      },
      {
        $match: {
          'payment.status': paymentStatus,
        },
      },
      { $count: 'total' },
    ];

    [orders, totalResult] = await Promise.all([
      this.aggregate([
        ...pipeline,
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userId',
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: 'products.product',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
      ]),
      this.aggregate(countPipeline),
    ]);

    total = totalResult[0]?.total || 0;
  } else {
    [orders, total] = await Promise.all([
      this.find(filter)
        .populate('userId', 'name email')
        .populate('products.product', 'name images')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      this.countDocuments(filter),
    ]);
  }

  return {
    orders,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalOrders: total,
      hasNextPage: skip + orders.length < total,
      hasPrevPage: parseInt(page) > 1,
    },
  };
};

orderSchema.statics.findByIdWithAuth = async function (
  orderId,
  userId,
  userRole
) {
  const order = await this.findOne({
    _id: orderId,
    isDeleted: false,
  })
    .populate('userId', 'name email')
    .populate('products.product', 'name images price description');

  if (!order) {
    throw new Error('Order with this ID not found');
  }

  if (userRole !== 'admin' && order.userId._id.toString() !== userId) {
    throw new Error('Not authorized to view this order');
  }

  return order;
};

orderSchema.statics.getOrderStatistics = async function () {
  const stats = await this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' },
        averageOrderValue: { $avg: '$totalPrice' },
        pendingOrders: {
          $sum: { $cond: [{ $eq: ['$orderStatus', 'pending'] }, 1, 0] },
        },
        processingOrders: {
          $sum: { $cond: [{ $eq: ['$orderStatus', 'processing'] }, 1, 0] },
        },
        shippedOrders: {
          $sum: { $cond: [{ $eq: ['$orderStatus', 'shipped'] }, 1, 0] },
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0] },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$orderStatus', 'cancelled'] }, 1, 0] },
        },
        sameAddressOrders: {
          $sum: { $cond: [{ $eq: ['$useSameAddress', true] }, 1, 0] },
        },
        differentAddressOrders: {
          $sum: { $cond: [{ $eq: ['$useSameAddress', false] }, 1, 0] },
        },
      },
    },
  ]);

  const monthlyStats = await this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        ordersCount: { $sum: 1 },
        revenue: { $sum: '$totalPrice' },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);

  return {
    overview: stats[0] || {},
    monthlyTrends: monthlyStats,
  };
};

orderSchema.statics.getDailyReports = async function () {
  return await this.aggregate([
    { $match: { isDeleted: false } },
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'orderId',
        as: 'payment',
      },
    },
    { $match: { 'payment.status': 'completed' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalSales: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

orderSchema.statics.getProductSalesByVendor = async function (vendorId) {
  if (!vendorId) {
    throw new Error('Vendor ID is required');
  }

  return await this.aggregate([
    { $match: { isDeleted: false } },
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'orderId',
        as: 'payment',
      },
    },
    { $match: { 'payment.status': 'completed' } },
    { $unwind: '$products' },
    {
      $lookup: {
        from: 'products',
        localField: 'products.product',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $match: {
        'product.vendor': new mongoose.Types.ObjectId(vendorId),
      },
    },
    {
      $group: {
        _id: '$products.product',
        totalQuantity: { $sum: '$products.quantity' },
        totalRevenue: {
          $sum: { $multiply: ['$products.price', '$products.quantity'] },
        },
        productName: { $first: '$product.name' },
        productId: { $first: '$product._id' },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        productId: 1,
        name: '$productName',
        totalQuantity: 1,
        totalRevenue: 1,
      },
    },
  ]);
};

orderSchema.statics.getVendorAnalytics = async function (vendorId) {
  const stats = await this.aggregate([
    { $match: { isDeleted: false } },
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'orderId',
        as: 'payment',
      },
    },
    { $match: { 'payment.status': 'completed' } },
    { $unwind: '$products' },
    {
      $lookup: {
        from: 'products',
        localField: 'products.product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    { $unwind: '$productInfo' },
    {
      $match: { 'productInfo.vendor': new mongoose.Types.ObjectId(vendorId) },
    },
    {
      $group: {
        _id: null,
        totalSales: {
          $sum: { $multiply: ['$products.quantity', '$products.price'] },
        },
        totalOrders: { $addToSet: '$_id' },
        totalProductsSold: { $sum: '$products.quantity' },
      },
    },
    {
      $project: {
        totalSales: 1,
        totalOrders: { $size: '$totalOrders' },
        totalProductsSold: 1,
      },
    },
  ]);

  return (
    stats[0] || {
      totalSales: 0,
      totalOrders: 0,
      totalProductsSold: 0,
    }
  );
};

// Instance Methods
orderSchema.methods.updateStatus = async function (updateData) {
  const { orderStatus, trackingNumber, deliveredAt } = updateData;

  const previousStatus = this.orderStatus;

  if (orderStatus) this.orderStatus = orderStatus;
  if (trackingNumber) this.trackingNumber = trackingNumber;
  if (deliveredAt) this.deliveredAt = deliveredAt;

  await this.save({ validateBeforeSave: true });
  await this.populate('userId', 'name email');

  if (orderStatus && orderStatus !== previousStatus) {
    await EmailService.sendOrderStatusUpdateEmail(this);
  }

  return this;
};

orderSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  return await this.save();
};

orderSchema.methods.canBeViewedBy = function (userId, userRole) {
  return userRole === 'admin' || this.userId._id.toString() === userId;
};

module.exports = mongoose.model('Order', orderSchema);
