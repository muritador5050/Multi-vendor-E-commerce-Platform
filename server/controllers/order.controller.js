const Order = require('../models/order.model');
const Product = require('../models/product.model');

//Order
class OrderController {
  static async createOrder(req, res) {
    try {
      for (const item of req.body.products) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product with ID ${item.product} not found`,
          });
        }
        item.price = product.price;
      }

      if (req.body.useSameAddress) {
        req.body.billingAddress = { ...req.body.shippingAddress };
      } else if (!req.body.billingAddress) {
        return res.status(400).json({
          success: false,
          message: 'Billing address is required when not using same address',
        });
      }

      const orderData = {
        ...req.body,
        userId: req.user.id,
      };

      delete orderData.user;

      const order = await Order.createNewOrder(orderData);

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getAllOrders(req, res) {
    try {
      const { orders, pagination } = await Order.getFilteredOrders(req.query);

      res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: {
          orders,
          pagination,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getOrderById(req, res) {
    try {
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
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 403).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateOrderStatus(req, res) {
    try {
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async deleteOrder(req, res) {
    try {
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getOrderStats(req, res) {
    try {
      const data = await Order.getOrderStatistics();

      res.json({
        success: true,
        message: 'Order statistics retrieved successfully',
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getDailySalesReport(req, res) {
    try {
      const data = await Order.getDailyReports();

      res.json({
        success: true,
        message: 'Daily sales report generated successfully',
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getSalesByProduct(req, res) {
    try {
      const data = await Order.getProductSalesByVendor(req.user.id);

      res.json({
        success: true,
        message: 'Top products sales report for vendor generated successfully',
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getVendorSalesAnalytics(req, res) {
    try {
      const data = await Order.getVendorAnalytics(req.user.id);

      res.json({
        success: true,
        message: 'Vendor analytics generated successfully',
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = OrderController;
