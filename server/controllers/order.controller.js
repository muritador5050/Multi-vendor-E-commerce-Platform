const mongoose = require('mongoose');
const Order_model = require('../models/order.model');
const { resSuccessObject } = require('../utils/responseObject');
const Product = require('../models/product.model');
const User = require('../controllers/user.controllers');

class Order {
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

    // Validate products exist
    const productIds = products.map((p) => p.product);
    const existingProducts = await Product.find({ _id: { $in: productIds } });

    if (existingProducts.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more products not found',
      });
    }
  }

  //Get all orders
  static async getAllOrders(req, res) {}

  //Get a single  order
  static async getOrderById(req, res) {}

  //Update new order
  static async updateOrder(req, res) {}

  //Delete new order
  static async delteOrder(req, res) {}
}

module.exports = Order;
