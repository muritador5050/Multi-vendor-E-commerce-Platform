const mongoose = require('mongoose');

/**
 * @openapi
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Review ID
 *         user:
 *           type: string
 *           format: uuid
 *           description: User ID who wrote the review
 *         product:
 *           type: string
 *           format: uuid
 *           description: Product ID being reviewed
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Rating given to the product
 *         comment:
 *           type: string
 *           description: Optional review comment
 *         isApproved:
 *           type: boolean
 *           default: false
 *           description: Whether the review is approved by admin
 *         isDeleted:
 *           type: boolean
 *           default: false
 *           description: Soft delete flag
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Review creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Review last update timestamp
 *       required:
 *         - user
 *         - product
 *         - rating
 */

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      required: true,
    },
    comment: {
      type: String,
      default: '',
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    // Add toJSON transform to clean up the output
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

reviewSchema.index(
  { product: 1, user: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  }
);

// Index for efficient querying of approved, non-deleted reviews
reviewSchema.index({ product: 1, isApproved: 1, isDeleted: 1 });

// Index for user's reviews
reviewSchema.index({ user: 1, isDeleted: 1 });

// Pre-save middleware to ensure rating is an integer
reviewSchema.pre('save', function (next) {
  if (this.rating !== undefined) {
    this.rating = Math.round(this.rating);
  }
  next();
});

// Static method to get average rating for a product
reviewSchema.statics.getAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        isDeleted: false,
        isApproved: true,
      },
    },
    {
      $group: {
        _id: '$product',
        productId: { $first: '$product' },
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  return stats[0] || { avgRating: 0, totalReviews: 0 };
};

module.exports = mongoose.model('Review', reviewSchema);
