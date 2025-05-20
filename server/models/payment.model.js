const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    paymentProvider: { type: String, required: true }, // Stripe, PayPal, etc.
    paymentId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paidAt: Date,
  },
  { timestamps: true }
);

paymentSchema.index({ paymentId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
