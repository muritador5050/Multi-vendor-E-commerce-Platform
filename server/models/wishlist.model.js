// models/wishlist.model.js
const mongoose = require('mongoose');
const Product = require('./product.model');

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique user-product combination and efficient queries
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

// Additional index for user-based queries (getting user's wishlist)
wishlistSchema.index({ user: 1, addedAt: -1 });

// Static method to validate ObjectId
wishlistSchema.statics.validateObjectId = function (id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid product ID format');
    error.statusCode = 400;
    throw error;
  }
};

// Static method to validate product exists
wishlistSchema.statics.validateProduct = async function (productId) {
  this.validateObjectId(productId);

  const product = await Product.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }
  return product;
};

// Static method to add product to wishlist
wishlistSchema.statics.addProductToWishlist = async function (
  userId,
  productId
) {
  await this.validateProduct(productId);

  const existingWishlistItem = await this.findOne({
    user: userId,
    product: productId,
  });

  if (existingWishlistItem) {
    const error = new Error('Product already in wishlist');
    error.statusCode = 409;
    error.data = existingWishlistItem;
    throw error;
  }

  const wishlistItem = new this({
    user: userId,
    product: productId,
  });

  await wishlistItem.save();
  await wishlistItem.populate('product');

  return wishlistItem;
};

// Static method to get user's wishlist with pagination
wishlistSchema.statics.getUserWishlistWithPagination = async function (
  userId,
  options = {}
) {
  const { page = 1, limit = 10, sort = 'addedAt' } = options;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const validSortFields = ['addedAt', 'createdAt', 'updatedAt'];
  const sortField = validSortFields.includes(sort) ? sort : 'addedAt';

  const [wishlistItems, totalCount] = await Promise.all([
    this.find({ user: userId })
      .populate('product')
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(limitNum),
    this.getUserWishlistCount(userId),
  ]);

  return {
    items: wishlistItems,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      totalItems: totalCount,
      itemsPerPage: limitNum,
      hasNext: pageNum < Math.ceil(totalCount / limitNum),
      hasPrev: pageNum > 1,
    },
  };
};

// Static method to remove product from wishlist
wishlistSchema.statics.removeProductFromWishlist = async function (
  userId,
  productId
) {
  this.validateObjectId(productId);

  const result = await this.deleteOne({
    user: userId,
    product: productId,
  });

  if (result.deletedCount === 0) {
    const error = new Error('Product not found in wishlist');
    error.statusCode = 404;
    throw error;
  }

  return result;
};

// Static method for getting wishlist count (useful for pagination)
wishlistSchema.statics.getUserWishlistCount = async function (userId) {
  return await this.countDocuments({ user: userId });
};

// Static method to check if product is in wishlist
wishlistSchema.statics.checkProductInWishlist = async function (
  userId,
  productId
) {
  this.validateObjectId(productId);

  const existingWishlistItem = await this.findOne({
    user: userId,
    product: productId,
  });

  return !!existingWishlistItem;
};

// Instance method to populate product details
wishlistSchema.methods.populateProduct = async function () {
  return await this.populate('product');
};

module.exports = mongoose.model('Wishlist', wishlistSchema);
