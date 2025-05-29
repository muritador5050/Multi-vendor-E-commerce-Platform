const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const { resSuccessObject } = require('../utils/responseObject');

//Controller
class CartController {
  static async addToCart(req, res) {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status.json({
        success: false,
        message: 'Product ID is required',
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [{ product: productId, quantity }],
      });
    }
    const itemsIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemsIndex > -1) {
      cart.items[itemsIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    cart.updatedAt = new Date();
    await cart.save();

    //Populate and return updated cart
    const updatedCart = await Cart.findOne({ user: req.user.id }).populate(
      'items.product',
      'name price image description'
    );

    const totalAmount = updatedCart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    const totalItems = updatedCart.items.reduce((total, item) => {
      return total + item.quantity;
    }, 0);

    res.json(
      resSuccessObject({
        message: 'Item added to cart successfully',
        results: {
          ...updatedCart.toObject(),
          totalItems,
          totalAmount,
        },
      })
    );
  }
  static async getCart(req, res) {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId })
      .populate('items.product', 'name price image description')
      .populate('user', 'name email');

    if (!cart) {
      return res.json(
        resSuccessObject({
          message: 'Cart is empty',
          results: {
            user: userId,
            items: [],
            totalItems: 0,
            totalAmount: 0,
          },
        })
      );
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    const totalItems = cart.items.reduce((total, item) => {
      return total + item.quantity;
    }, 0);

    res.json(
      resSuccessObject({
        message: 'Cart retrieved successfully',
        results: {
          ...cart.toObject(),
          totalItems,
          totalAmount,
        },
      })
    );
  }

  //Update item quantity in cart
  static async updateCartItem(req, res) {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required',
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity cannot be negative',
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    cart.updatedAt = new Date();
    await cart.save();
    // Populate and return updated cart
    const updatedCart = await Cart.findOne({ user: userId }).populate(
      'items.product',
      'name price image description'
    );

    const totalAmount = updatedCart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    const totalItems = updatedCart.items.reduce((total, item) => {
      return total + item.quantity;
    }, 0);

    res.json(
      resSuccessObject({
        message: 'Cart updated successfully',
        results: {
          ...updatedCart.toObject(),
          totalItems,
          totalAmount,
        },
      })
    );
  }
  static async removeFromCart(req, res) {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
    }

    cart.items.splice(itemIndex, 1);
    cart.updatedAt = new Date();
    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findOne({ user: userId }).populate(
      'items.product',
      'name price image description'
    );

    const totalAmount = updatedCart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    const totalItems = updatedCart.items.reduce((total, item) => {
      return total + item.quantity;
    }, 0);

    res.json(
      resSuccessObject({
        message: 'Item removed from cart successfully',
        results: {
          ...updatedCart.toObject(),
          totalItems,
          totalAmount,
        },
      })
    );
  }
  static async clearCart(req, res) {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    res.json(
      resSuccessObject({
        message: 'Cart cleared successfully',
        results: {
          user: userId,
          items: [],
          totalItems: 0,
          totalAmount: 0,
        },
      })
    );
  }
}

module.exports = CartController;
