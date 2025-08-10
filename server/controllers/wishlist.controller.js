const Wishlist = require('../models/wishlist.model');

class WishlistController {
  // Add a product to the wishlist
  static async addToWishlist(req, res) {
    const { productId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!productId) {
      const error = new Error('Product ID is required');
      error.statusCode = 400;
      throw error;
    }

    const wishlistItem = await Wishlist.addProductToWishlist(userId, productId);

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist successfully',
      data: wishlistItem,
    });
  }

  // Get all products in the user's wishlist
  static async getWishlist(req, res) {
    const userId = req.user.id;
    const options = req.query;

    const result = await Wishlist.getUserWishlistWithPagination(
      userId,
      options
    );

    res.status(200).json({
      success: true,
      message: 'Wishlist retrieved successfully',
      data: result.items,
      pagination: result.pagination,
    });
  }

  // Remove a product from the wishlist
  static async removeFromWishlist(req, res) {
    const { productId } = req.params;
    const userId = req.user.id;

    // Validate input
    if (!productId) {
      const error = new Error('Product ID is required');
      error.statusCode = 400;
      throw error;
    }

    await Wishlist.removeProductFromWishlist(userId, productId);

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist successfully',
    });
  }

  // Get wishlist count for a user
  static async getWishlistCount(req, res) {
    const userId = req.user.id;
    const count = await Wishlist.getUserWishlistCount(userId);

    res.status(200).json({
      success: true,
      message: 'Wishlist count retrieved successfully',
      data: count,
    });
  }

  // Check if a product is in user's wishlist
  static async checkWishlistStatus(req, res) {
    const { productId } = req.params;
    const userId = req.user.id;

    // Validate input
    if (!productId) {
      const error = new Error('Product ID is required');
      error.statusCode = 400;
      throw error;
    }

    const isInWishlist = await Wishlist.checkProductInWishlist(
      userId,
      productId
    );

    res.status(200).json({
      success: true,
      message: 'Wishlist status checked successfully',
      data: isInWishlist,
    });
  }
}

module.exports = WishlistController;
