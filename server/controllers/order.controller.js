const Order = require('../models/order.model');

class OrderController {
  static async createOrder(req, res) {
    const order = await Order.createNewOrder(req.body);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  }

  static async getAllOrders(req, res) {
    const { orders, pagination } = await Order.getFilteredOrders(req.query);

    res.json({
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
      pagination,
    });
  }

  static async getOrderById(req, res) {
    const order = await Order.findByIdWithAuth(
      req.params.id,
      req.user.id,
      req.user.role
    );

    res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    });
  }

  static async updateOrderStatus(req, res) {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const updatedOrder = await order.updateStatus(req.body);

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder,
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

    await order.softDelete();

    res.status(200).json({
      success: true,
      message: 'Order marked as deleted',
    });
  }

  static async getOrderStats(req, res) {
    const data = await Order.getOrderStatistics();

    res.json({
      success: true,
      message: 'Order statistics retrieved successfully',
      data,
    });
  }

  static async getDailySalesReport(req, res) {
    const data = await Order.getDailyReports();

    res.json({
      success: true,
      message: 'Daily sales report generated successfully',
      data,
    });
  }

  static async getSalesByProduct(req, res) {
    const data = await Order.getProductSalesByVendor(req.user.id);

    res.json({
      success: true,
      message: 'Top products sales report for vendor generated successfully',
      data,
    });
  }

  static async getVendorSalesAnalytics(req, res) {
    const data = await Order.getVendorAnalytics(req.user.id);

    res.json({
      success: true,
      message: 'Vendor analytics generated successfully',
      data,
    });
  }
}

module.exports = OrderController;
