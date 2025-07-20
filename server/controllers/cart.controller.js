const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

class CartController {
  static async addToCart(req, res) {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required or Quantity must be at least 1',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const cart = await Cart.findOrCreateCart(req.user.id);
    cart.addItem(productId, quantity);
    await cart.save();

    const updatedCart = await Cart.getPopulatedCart(req.user.id);

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: updatedCart.toResponseFormat(),
    });
  }

  static async getCart(req, res) {
    const cart = await Cart.getPopulatedCart(req.user.id);

    if (!cart) {
      return res.json(Cart.getEmptyCartResponse(req.user.id));
    }

    res.json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cart.toResponseFormat(),
    });
  }

  static async updateProductQuantity(req, res) {
    const { quantity } = req.body;
    const productId = req.params.id;

    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Quantity is required',
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity cannot be negative',
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const updated = cart.updateItemQuantity(productId, quantity);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    await cart.save();
    const updatedCart = await Cart.getPopulatedCart(req.user.id);

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: updatedCart.toResponseFormat(),
    });
  }

  static async deleteCartItem(req, res) {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const removed = cart.removeItem(productId);
    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart',
    });
  }

  static async clearCart(req, res) {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.clearItems();
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  }
}

module.exports = CartController;
