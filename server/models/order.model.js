const mongoose = require('mongoose');

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
    paymentMethod: { type: String, required: true }, // e.g., Stripe, PayPal, COD
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

orderSchema.index({ user: 1, orderStatus: 1, trackingNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
