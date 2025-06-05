const mongoose = require('mongoose');

/**
 * @openapi
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         order:
 *           type: string
 *           format: uuid
 *         paymentProvider:
 *           type: string
 *         paymentId:
 *           type: string
 *         amount:
 *           type: number
 *           format: float
 *         currency:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 */
const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    paymentProvider: { type: String, required: true }, // Stripe, PayPal, etc.
    paymentId: { type: String, required: true, unique: true, index: true },
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

module.exports = mongoose.model('Payment', paymentSchema);
