const mongoose = require('mongoose');
const User = require('./user.model');

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
 *         paymentMethod:
 *           type: string
 *           description: Payment method used for the order (e.g., Stripe, PayPal, COD)
 *         paymentStatus:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *           default: pending
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
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
    paymentMethod: {
      type: String,
      required: true,
      enum: ['stripe', 'paypal', 'cod', 'bank_transfer'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
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

orderSchema.index({ user: 1, orderStatus: 1 });
orderSchema.index({ trackingNumber: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ isDeleted: 1 });

// Static Methods
orderSchema.statics.validateOrderData = function (orderData) {
  const { user, products, paymentMethod, totalPrice } = orderData;

  if (!user || !products || !paymentMethod || !totalPrice) {
    throw new Error(
      'Required fields: user, products, paymentMethod, totalPrice'
    );
  }

  if (!products || products.length === 0) {
    throw new Error('No products in the order');
  }

  for (const item of products) {
    if (!item.product || !item.quantity) {
      throw new Error('Each product must have product ID and quantity');
    }
  }
};

orderSchema.statics.createNewOrder = async function (orderData) {
  this.validateOrderData(orderData);

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
    { path: 'user', select: 'name email' },
    // { path: 'products.product', select: 'name price' },
  ]);
};

orderSchema.statics.getFilteredOrders = async function (queryParams) {
  const {
    page = 1,
    limit = 10,
    orderStatus,
    paymentStatus,
    user,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    startDate,
    endDate,
    search,
  } = queryParams;

  const filter = { isDeleted: false };

  if (orderStatus) filter.orderStatus = orderStatus;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (user) filter.user = user;

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
        user: { $in: matchingUsers.map((u) => u._id) },
      });
    }

    if (search.match(/^[0-9a-fA-F]{24}$/)) {
      filter.$or.push({ _id: search });
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [orders, total] = await Promise.all([
    this.find(filter)
      .populate('user', 'name email')
      .populate('products.product', 'name quantity price')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    this.countDocuments(filter),
  ]);

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
    .populate('user', 'name email')
    .populate('products.product', 'name price description');

  if (!order) {
    throw new Error('Order with this ID not found');
  }

  if (userRole !== 'admin' && order.user._id.toString() !== userId) {
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
    { $match: { isDeleted: false, paymentStatus: 'pending' } },
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
    { $match: { isDeleted: false, paymentStatus: 'pending' } },
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
    { $match: { isDeleted: false, paymentStatus: 'paid' } },
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

  if (orderStatus) this.orderStatus = orderStatus;
  if (trackingNumber) this.trackingNumber = trackingNumber;
  if (deliveredAt) this.deliveredAt = deliveredAt;

  await this.save({ validateBeforeSave: true });
  await this.populate('user', 'name email');

  return this;
};

orderSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  return await this.save();
};

orderSchema.methods.canBeViewedBy = function (userId, userRole) {
  return userRole === 'admin' || this.user._id.toString() === userId;
};

module.exports = mongoose.model('Order', orderSchema);
