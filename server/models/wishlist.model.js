// models/wishlist.model.js
const mongoose = require('mongoose');

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

// Static method for getting wishlist count (useful for pagination)
wishlistSchema.statics.getUserWishlistCount = async function (userId) {
  return await this.countDocuments({ user: userId });
};

module.exports = mongoose.model('Wishlist', wishlistSchema);
