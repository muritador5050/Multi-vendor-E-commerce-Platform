const Wishlist = require('../models/wishlist.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');

class WishlistController {
  // Add a product to the wishlist
  static async addToWishlist(req, res) {
    try {
      const { productId } = req.body;
      const userId = req.user._id;

      // Check if the product exists
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
        return res.status(400).json({ message: 'Product already in wishlist' });
      }

      // Create a new wishlist item
      const wishlistItem = new Wishlist({
        user: userId,
        product: productId,
      });

      await wishlistItem.save();
      res
        .status(201)
        .json({ message: 'Product added to wishlist', data: wishlistItem });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Get all products in the user's wishlist
  static async getWishlist(req, res) {
    try {
      const userId = req.user._id;
      const wishlistItems = await Wishlist.find({ user: userId }).populate(
        'product'
      );

      res.status(200).json({ data: wishlistItems });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  // Remove a product from the wishlist
  static async removeFromWishlist(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user._id;

      const result = await Wishlist.deleteOne({
        user: userId,
        product: productId,
      });

      if (result.deletedCount === 0) {
        return res
          .status(404)
          .json({ message: 'Product not found in wishlist' });
      }

      res.status(200).json({ message: 'Product removed from wishlist' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = WishlistController;
