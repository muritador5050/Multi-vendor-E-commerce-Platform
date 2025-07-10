const Order = require('../models/order.model');
const User = require('../models/user.model');

class OrderController {
  static async createOrder(req, res) {
    const {
      user,
      products,
      shippingAddress,
      billingAddress,
      paymentMethod,
      totalPrice,
      shippingCost,
      estimatedDelivery,
    } = req.body;

    if (!user || !products || !paymentMethod || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: user, products, paymentMethod, totalPrice',
      });
    }

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No products in the order',
      });
    }

    for (const item of products) {
      if (!item.product || !item.quantity || !item.price) {
        return res.status(400).json({
          success: false,
          message: 'Each product must have product ID, quantity, and price',
        });
      }
    }

    const order = await Order.create({
      user,
      products,
      shippingAddress,
      billingAddress,
      paymentMethod,
      totalPrice,
      shippingCost: shippingCost || 0,
      estimatedDelivery,
    });

    await order.populate('user', 'name email');
    await order.populate('products.product', 'name price');

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  }

  static async getAllOrders(req, res) {
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
    } = req.query;

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

      const matchingUsers = await User.find(
        {
          $or: [{ name: searchRegex }, { email: searchRegex }],
        }
        // { _id: 1 }
      ).lean();

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
      Order.find(filter)
        .populate('user', 'name email')
        .populate('products.product', 'name price')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        hasNextPage: skip + orders.length < total,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  }

  static async getOrderById(req, res) {
    const order = await Order.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate('user', 'name email')
      .populate('products.product', 'name price description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order with this ID not found',
      });
    }

    if (
      req.user.role !== 'admin' &&
      order.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }

    res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    });
  }

  static async updateOrderStatus(req, res) {
    const { orderStatus, trackingNumber, deliveredAt } = req.body;

    const updateFields = {};
    if (orderStatus) updateFields.orderStatus = orderStatus;
    if (trackingNumber) updateFields.trackingNumber = trackingNumber;
    if (deliveredAt) updateFields.deliveredAt = deliveredAt;

    const order = await Order.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order,
    });
  }

  static async deleteOrder(req, res) {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.isDeleted = true;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order marked as deleted',
    });
  }

  static async getOrderStats(req, res) {
    const stats = await Order.aggregate([
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

    const monthlyStats = await Order.aggregate([
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

    res.json({
      success: true,
      message: 'Order statistics retrieved successfully',
      data: {
        overview: stats[0] || {},
        monthlyTrends: monthlyStats,
      },
    });
  }
}

module.exports = OrderController;
