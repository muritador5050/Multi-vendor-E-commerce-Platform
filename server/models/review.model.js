const mongoose = require('mongoose');
const Product = require('./product.model');

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

// STATIC METHODS

// Validate review creation data
reviewSchema.statics.validateReviewData = function (data) {
  const { product, rating } = data;

  if (!product || !rating) {
    throw new Error('Required fields: product, rating');
  }

  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  if (!mongoose.Types.ObjectId.isValid(product)) {
    throw new Error('Invalid product ID format');
  }
};

// Validate ObjectId
reviewSchema.statics.validateObjectId = function (id, fieldName = 'ID') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
};

// Check if product exists
reviewSchema.statics.verifyProductExists = async function (productId) {
  const productExist = await Product.findById(productId);
  if (!productExist) {
    throw new Error('Product not found');
  }
  return productExist;
};

// Create or update review
reviewSchema.statics.createOrUpdateReview = async function (
  userId,
  productId,
  rating,
  comment
) {
  this.validateReviewData({ product: productId, rating });
  await this.verifyProductExists(productId);

  const existingReview = await this.findOne({
    product: productId,
    user: userId,
    isDeleted: false,
  });

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment || '';
    existingReview.isApproved = false; // re-approval needed
    await existingReview.save();

    await existingReview.populate([
      { path: 'user', select: 'name email' },
      { path: 'product', select: 'name price' },
    ]);

    return { review: existingReview, isUpdate: true };
  }

  const review = await this.create({
    user: userId,
    product: productId,
    rating,
    comment: comment || '',
  });

  await review.populate([
    { path: 'user', select: 'name email' },
    { path: 'product', select: 'name price' },
  ]);

  return { review, isUpdate: false };
};

// Get reviews with filtering and pagination
reviewSchema.statics.getReviewsWithPagination = async function (queryParams) {
  const {
    page = 1,
    limit = 10,
    product,
    user,
    isApproved,
    isDeleted = false,
    minRating,
    maxRating,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = queryParams;

  // Validate pagination parameters
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));

  // Build filter object
  const filter = { isDeleted: isDeleted === 'true' };

  // Validate ObjectId fields
  if (product) {
    this.validateObjectId(product, 'product ID');
    filter.product = product;
  }

  if (user) {
    this.validateObjectId(user, 'user ID');
    filter.user = user;
  }

  if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

  if (minRating || maxRating) {
    filter.rating = {};
    if (minRating) {
      const minRatingNum = parseInt(minRating);
      if (minRatingNum >= 1 && minRatingNum <= 5) {
        filter.rating.$gte = minRatingNum;
      }
    }
    if (maxRating) {
      const maxRatingNum = parseInt(maxRating);
      if (maxRatingNum >= 1 && maxRatingNum <= 5) {
        filter.rating.$lte = maxRatingNum;
      }
    }
  }

  // Build sort object
  const allowedSortFields = ['createdAt', 'updatedAt', 'rating'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sort = {};
  sort[sortField] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total] = await Promise.all([
    this.find(filter)
      .populate([
        { path: 'user', select: 'name email avatar' },
        { path: 'product', select: 'name price images' },
      ])
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    this.countDocuments(filter),
  ]);

  return {
    reviews,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      totalReviews: total,
      hasNextPage: skip + reviews.length < total,
      hasPrevPage: pageNum > 1,
    },
  };
};

// Find review by ID with population
reviewSchema.statics.findReviewById = async function (reviewId) {
  this.validateObjectId(reviewId, 'review ID');

  const review = await this.findOne({
    _id: reviewId,
    isDeleted: false,
  }).populate([
    { path: 'user', select: 'name email avatar' },
    { path: 'product', select: 'name price images' },
  ]);

  if (!review) {
    throw new Error('Review not found');
  }

  return review;
};

// Get average rating for a product
reviewSchema.statics.getAverageRating = async function (productId) {
  this.validateObjectId(productId, 'product ID');

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
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
    {
      $addFields: {
        avgRating: { $round: ['$avgRating', 2] },
      },
    },
  ]);

  return stats[0] || { avgRating: 0, totalReviews: 0 };
};

// Get review statistics
reviewSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        approvedReviews: {
          $sum: { $cond: [{ $eq: ['$isApproved', true] }, 1, 0] },
        },
        pendingReviews: {
          $sum: { $cond: [{ $eq: ['$isApproved', false] }, 1, 0] },
        },
        averageRating: { $avg: '$rating' },
        rating1: {
          $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] },
        },
        rating2: {
          $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] },
        },
        rating3: {
          $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] },
        },
        rating4: {
          $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] },
        },
        rating5: {
          $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] },
        },
      },
    },
    {
      $addFields: {
        averageRating: { $round: ['$averageRating', 2] },
      },
    },
  ]);

  return (
    stats[0] || {
      totalReviews: 0,
      approvedReviews: 0,
      pendingReviews: 0,
      averageRating: 0,
      rating1: 0,
      rating2: 0,
      rating3: 0,
      rating4: 0,
      rating5: 0,
    }
  );
};

// INSTANCE METHODS

// Toggle approval status
reviewSchema.methods.toggleApproval = async function () {
  this.isApproved = !this.isApproved;
  return await this.save();
};

// Soft delete review
reviewSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  return await this.save();
};

// Check if user can delete this review
reviewSchema.methods.canBeDeletedBy = function (userId, isAdmin = false) {
  return this.user.toString() === userId || isAdmin;
};

// Update review content
reviewSchema.methods.updateContent = async function (rating, comment) {
  this.rating = rating;
  this.comment = comment || '';
  this.isApproved = false; // re-approval needed
  return await this.save();
};

module.exports = mongoose.model('Review', reviewSchema);
