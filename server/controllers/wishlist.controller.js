const Wishlist = require('../models/wishlist.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');

class WishlistController {
  // Add a product to the wishlist
  static async addToWishlist(req, res) {
    try {
      const { productId } = req.body;
      const userId = req.user._id;

      // Validate productId format
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid product ID format' });
      }

      // Check if the product exists and is active (assuming products have an active field)
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Check if the product is already in the wishlist
      const existingWishlistItem = await Wishlist.findOne({
        user: userId,
        product: productId,
      });
      if (existingWishlistItem) {
        return res.status(409).json({
          message: 'Product already in wishlist',
          data: existingWishlistItem,
        });
      }

      // Create a new wishlist item
      const wishlistItem = new Wishlist({
        user: userId,
        product: productId,
      });

      await wishlistItem.save();

      // Populate the product data in the response
      await wishlistItem.populate('product');

      res.status(201).json({
        message: 'Product added to wishlist successfully',
        data: wishlistItem,
      });
    } catch (error) {
      // Handle duplicate key error specifically
      if (error.code === 11000) {
        return res.status(409).json({ message: 'Product already in wishlist' });
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          message: 'Validation error',
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }

      console.error('Error adding to wishlist:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get all products in the user's wishlist
  static async getWishlist(req, res) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10, sort = 'addedAt' } = req.query;

      // Convert to numbers and validate
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Cap at 50 items per page
      const skip = (pageNum - 1) * limitNum;

      // Validate sort field
      const validSortFields = ['addedAt', 'createdAt', 'updatedAt'];
      const sortField = validSortFields.includes(sort) ? sort : 'addedAt';

      // Get wishlist items with pagination
      const wishlistItems = await Wishlist.find({ user: userId })
        .populate('product')
        .sort({ [sortField]: -1 })
        .skip(skip)
        .limit(limitNum);

      // Get total count for pagination
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
    } catch (error) {
      console.error('Error getting wishlist:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Remove a product from the wishlist
  static async removeFromWishlist(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user._id;

      // Validate productId format
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid product ID format' });
      }

      const result = await Wishlist.deleteOne({
        user: userId,
        product: productId,
      });

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ message: 'Product not found in wishlist' });
      }

      res
        .status(200)
        .json({ message: 'Product removed from wishlist successfully' });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get wishlist count for a user
  static async getWishlistCount(req, res) {
    try {
      const userId = req.user._id;
      const count = await Wishlist.getUserWishlistCount(userId);

      res.status(200).json({ count });
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Check if a product is in user's wishlist
  static async checkWishlistStatus(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user._id;

      // Validate productId format
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({ message: 'Invalid product ID format' });
      }

      const existingWishlistItem = await Wishlist.findOne({
        user: userId,
        product: productId,
      });

      res.status(200).json({ isInWishlist: !!existingWishlistItem });
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = WishlistController;
