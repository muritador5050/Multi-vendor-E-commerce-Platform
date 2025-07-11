const Wishlist = require('../models/wishlist.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');

class WishlistController {
  // Add a product to the wishlist
  static async addToWishlist(req, res) {
    const { productId } = req.body;
    const userId = req.user.id;

    // Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error('Invalid product ID format');
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const existingWishlistItem = await Wishlist.findOne({
      user: userId,
      product: productId,
    });
    if (existingWishlistItem) {
      res.status(409);
      return res.json({
        message: 'Product already in wishlist',
        data: existingWishlistItem,
      });
    }

    const wishlistItem = new Wishlist({
      user: userId,
      product: productId,
    });

    await wishlistItem.save();
    await wishlistItem.populate('product');

    res.status(201).json({
      message: 'Product added to wishlist successfully',
      data: wishlistItem,
    });
  }

  // Get all products in the user's wishlist
  static async getWishlist(req, res) {
    const userId = req.user.id;
    const { page = 1, limit = 10, sort = 'addedAt' } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const validSortFields = ['addedAt', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sort) ? sort : 'addedAt';

    const wishlistItems = await Wishlist.find({ user: userId })
      .populate('product')
      .sort({ [sortField]: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalCount = await Wishlist.getUserWishlistCount(userId);

    res.status(200).json({
      data: wishlistItems,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNext: pageNum < Math.ceil(totalCount / limitNum),
        hasPrev: pageNum > 1,
      },
    });
  }

  // Remove a product from the wishlist
  static async removeFromWishlist(req, res) {
    const { productId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error('Invalid product ID format');
    }

    const result = await Wishlist.deleteOne({
      user: userId,
      product: productId,
    });

    if (result.deletedCount === 0) {
      res.status(404);
      throw new Error('Product not found in wishlist');
    }

    res.status(200).json({
      message: 'Product removed from wishlist successfully',
    });
  }

  // Get wishlist count for a user
  static async getWishlistCount(req, res) {
    const userId = req.user.id;
    const count = await Wishlist.getUserWishlistCount(userId);

    res.status(200).json({ count });
  }

  // Check if a product is in user's wishlist
  static async checkWishlistStatus(req, res) {
    const { productId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400);
      throw new Error('Invalid product ID format');
    }

    const existingWishlistItem = await Wishlist.findOne({
      user: userId,
      product: productId,
    });

    res.status(200).json({ isInWishlist: !!existingWishlistItem });
  }
}

module.exports = WishlistController;
