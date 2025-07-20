const mongoose = require('mongoose');

/**
 * @openapi
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           format: uuid
 *         items:
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
 */
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

cartSchema.index({ user: 1 }, { unique: true });

// Instance Methods
cartSchema.methods.calculateTotals = function () {
  const totalAmount = this.items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  const totalItems = this.items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  return { totalAmount, totalItems };
};

cartSchema.methods.addItem = function (productId, quantity = 1) {
  const itemIndex = this.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    this.items[itemIndex].quantity += quantity;
  } else {
    this.items.push({ product: productId, quantity });
  }

  this.updatedAt = new Date();
  return this;
};

cartSchema.methods.updateItemQuantity = function (productId, quantity) {
  const itemIndex = this.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return false;
  }

  if (quantity === 0) {
    this.items.splice(itemIndex, 1);
  } else {
    this.items[itemIndex].quantity = quantity;
  }

  this.updatedAt = new Date();
  return true;
};

cartSchema.methods.removeItem = function (productId) {
  const itemIndex = this.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return false;
  }

  this.items.splice(itemIndex, 1);
  this.updatedAt = new Date();
  return true;
};

cartSchema.methods.clearItems = function () {
  this.items = [];
  this.updatedAt = new Date();
  return this;
};

cartSchema.methods.toResponseFormat = function () {
  const { totalAmount, totalItems } = this.calculateTotals();
  return {
    ...this.toObject(),
    totalItems,
    totalAmount,
  };
};

// Static Methods
cartSchema.statics.findOrCreateCart = async function (userId) {
  let cart = await this.findOne({ user: userId });

  if (!cart) {
    cart = new this({
      user: userId,
      items: [],
    });
  }

  return cart;
};

cartSchema.statics.getPopulatedCart = async function (userId) {
  return await this.findOne({ user: userId })
    .populate('items.product')
    .populate('user', 'name email');
};

cartSchema.statics.getEmptyCartResponse = function (userId) {
  return {
    success: true,
    message: 'Cart is empty',
    data: {
      user: userId,
      items: [],
      totalItems: 0,
      totalAmount: 0,
    },
  };
};

module.exports = mongoose.model('Cart', cartSchema);
