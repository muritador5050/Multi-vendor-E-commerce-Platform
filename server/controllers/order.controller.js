const Order = require('../models/order.model');
const { resSuccessObject } = require('../utils/responseObject');

class OrderController {
  //Create new order
  static async creatOrder(req, res) {
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

    // Validate required fields
    if (!user || !products || !paymentMethod || !totalPrice) {
      return res.json(
        resSuccessObject({
          success: false,
          message:
            'Required fields: user, products, paymentMethod, totalPrice ',
        })
      );
    }

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No products in the order',
      });
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
    await order.save();
    await order.populate('user', 'name email');
    await order.populate('products.product', 'name price');

    return res.json(
      resSuccessObject({
        message: 'Order created successfully',
        results: order,
      })
    );
  }

  //Get all orders
  static async getAllOrders(req, res) {
    const {
      page = 1,
      limit = 10,
      orderStatus,
      paymentStatus,
      user,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter object
    const filter = { isDeleted: false };

    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (user) filter.user = user;

    // Calculate pagination
    const skip = (parent(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get orders with pagination
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('products.product', 'name price')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Order.countDocuments(filter);

    res.json(
      resSuccessObject({
        results: orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalOrders: total,
          hasNextPage: skip + orders.length < total,
          hasPrevPage: parseInt(page) > 1,
        },
      })
    );
  }

  static async getOrderByUser(req, res) {
    const order = await Order.find({ user: req.user._id }).populate(
      'products.product'
    );

    res.json(resSuccessObject({ results: order }));
  }
  //Get a single  order
  static async getOrderById(req, res) {
    const order = await Order.findById({ _id: req.params.id, isDeleted: false })
      .populate('user', 'name email')
      .populate('products.product', 'name price description');

    if (!order) {
      return res.status(400).json({
        message: `Order with this ID not found`,
      });
    }

    // Allow user to access only their own orders
    if (
      !req.user.isAdmin &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to view this order' });
    }
    res.json(
      resSuccessObject({
        results: order,
      })
    );
  }

  //Update new order
  static async updateOrderStatus(req, res) {
    const { orderStatus, trackingNumber, deliveredAt } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (deliveredAt) order.deliveredAt = deliveredAt;

    await order.save();
    //update order
    res.json(resSuccessObject({ results: order }));
  }

  //Delete new order
  static async deleteOrder(req, res) {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isDeleted = true;
    await order.save();

    res.status(200).json({ message: 'Order marked as deleted' });
  }

  // Get order statistics
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

    res.json(
      resSuccessObject({
        results: {
          overview: stats[0] || {},
          monthlyTrends: monthlyStats,
        },
      })
    );
  }
}

module.exports = OrderController;
