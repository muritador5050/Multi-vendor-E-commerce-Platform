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
 *         userId:
 *           type: object
 *           description: User who wrote the review
 *         productId:
 *           type: object
 *           description: Product being reviewed
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
 *         - userId
 *         - productId
 *         - rating
 */

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
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
      default: true,
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
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

reviewSchema.index(
  { productId: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  }
);

reviewSchema.index({ productId: 1, isApproved: 1, isDeleted: 1 });
reviewSchema.index({ userId: 1, isDeleted: 1 });

// Function to update product rating statistics
async function updateProductRatingStats(productId) {
  try {
    const stats = await mongoose.model('Review').aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
          isDeleted: false,
          isApproved: true,
        },
      },
      {
        $group: {
          _id: '$productId',
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

    const { avgRating = 0, totalReviews = 0 } = stats[0] || {};

    await Product.findByIdAndUpdate(
      productId,
      {
        averageRating: avgRating,
        totalReviews: totalReviews,
      },
      { new: true }
    );
  } catch (error) {
    console.error('Error updating product rating stats:', error);
  }
}

reviewSchema.post('save', async function (doc) {
  if (doc.productId) {
    await updateProductRatingStats(doc.productId);
  }
});

reviewSchema.post('remove', async function (doc) {
  if (doc.productId) {
    await updateProductRatingStats(doc.productId);
  }
});

reviewSchema.post('findOneAndUpdate', async function (doc) {
  if (doc && doc.productId) {
    await updateProductRatingStats(doc.productId);
  }
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc && doc.productId) {
    await updateProductRatingStats(doc.productId);
  }
});

reviewSchema.pre('save', function (next) {
  if (this.rating !== undefined) {
    this.rating = Math.round(this.rating);
  }
  next();
});

// ============ STATIC METHODS ============

// Validate review creation data
reviewSchema.statics.validateReviewData = function (data) {
  const { productId, rating } = data;

  if (!productId || !rating) {
    throw new Error('Required fields: productId, rating');
  }

  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
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

reviewSchema.statics.createOrUpdateReview = async function (
  userId,
  productId,
  rating,
  comment
) {
  this.validateReviewData({ productId, rating });
  await this.verifyProductExists(productId);

  const existingReview = await this.findOne({
    productId,
    userId,
    isDeleted: false,
  });

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment || '';

    await existingReview.save();

    await existingReview.populate([
      { path: 'userId', select: 'name email avatar' },
      { path: 'productId', select: 'name price images' },
    ]);

    return { review: existingReview, isUpdate: true };
  }

  const review = await this.create({
    userId,
    productId,
    rating,
    comment: comment || '',
  });

  await review.populate([
    { path: 'userId', select: 'name email avatar' },
    { path: 'productId', select: 'name price images' },
  ]);

  return { review, isUpdate: false };
};

// Get reviews with filtering and pagination
reviewSchema.statics.getReviewsWithPagination = async function (queryParams) {
  const {
    page = 1,
    limit = 10,
    productId,
    userId,
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
  if (productId) {
    this.validateObjectId(productId, 'product ID');
    filter.productId = productId;
  }

  if (userId) {
    this.validateObjectId(userId, 'user ID');
    filter.userId = userId;
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
        { path: 'userId', select: 'name email avatar' },
        { path: 'productId', select: 'name price images' },
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

reviewSchema.statics.findReviewById = async function (reviewId) {
  this.validateObjectId(reviewId, 'review ID');

  const review = await this.findOne({
    _id: reviewId,
    isDeleted: false,
  }).populate([
    { path: 'userId', select: 'name email avatar' },
    { path: 'productId', select: 'name price images' },
  ]);

  if (!review) {
    throw new Error('Review not found');
  }

  return review;
};

reviewSchema.statics.getAverageRating = async function (productId) {
  this.validateObjectId(productId, 'product ID');

  const stats = await this.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
        isDeleted: false,
        isApproved: true,
      },
    },
    {
      $group: {
        _id: '$productId',
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

// Manually recalculate and update all product ratings (utility function)
reviewSchema.statics.recalculateAllProductRatings = async function () {
  const products = await Product.find({ isDeleted: false }, '_id');

  for (const product of products) {
    await updateProductRatingStats(product._id);
  }

  return { message: `Updated ratings for ${products.length} products` };
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

// ============ INSTANCE METHODS ============

// Toggle approval status (now updates product stats)
reviewSchema.methods.toggleApproval = async function () {
  this.isApproved = !this.isApproved;
  const result = await this.save();
  return result;
};

// Soft delete review (now updates product stats)
reviewSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  const result = await this.save();
  return result;
};

// Check if user can delete this review
reviewSchema.methods.canBeDeletedBy = function (userId, isAdmin = false) {
  return this.userId.toString() === userId || isAdmin;
};

// Update review content (now updates product stats)
reviewSchema.methods.updateContent = async function (rating, comment) {
  this.rating = rating;
  this.comment = comment || '';
  const result = await this.save();
  return result;
};

module.exports = mongoose.model('Review', reviewSchema);
