const Review = require('../models/review.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');
const { resSuccessObject } = require('../utils/responseObject');

class ReviewController {
  // Create a new review - AUTHENTICATED USERS ONLY
  static async createReview(req, res) {
    const { product, rating, comment } = req.body;
    const user = req.user.id;

    // Check if product is already reviewed by this user
    const existingReview = await Review.findOne({
      product,
      user: user,
      isDeleted: false,
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.isApproved = false; // re-approval needed

      //Save
      await existingReview.save();

      //Response
      return res.json(
        resSuccessObject({
          message: 'Review updated successfully',
          results: existingReview,
        })
      );
    }

    // Verify product exists
    const productExist = await Product.findById(product);
    if (!productExist) {
      return res.status(400).json({
        success: false,
        message: 'Product not found',
      });
    }

    const review = await Review.create({
      user,
      product,
      rating,
      comment: comment || '',
    });

    // Populate user and product details
    await review.populate([
      { path: 'user', select: 'name email' },
      { path: 'product', select: 'name price' },
    ]);

    res.json(
      resSuccessObject({
        message: 'Review created successfully',
        results: review,
      })
    );
  }

  // Get reviews - PUBLIC ACCESS (no authentication required for viewing)
  static async getReviews(req, res) {
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
    } = req.query;

    // Build filter object
    const filter = { isDeleted: isDeleted === 'true' };

    if (product) filter.product = product;
    if (user) filter.user = user;
    if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

    if (minRating || maxRating) {
      filter.rating = {};
      if (minRating) filter.rating.$gte = parseInt(minRating);
      if (maxRating) filter.rating.$lte = parseInt(maxRating);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination - FIX: Missing parentheses
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate([
          { path: 'user', select: 'name email avater' },
          { path: 'product', select: 'name price, images' },
        ])
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Review.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      reviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  }

  // Get single review - PUBLIC ACCESS
  static async getReviewById(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID',
      });
    }

    const review = await Review.findOne({
      _id: id,
      isDeleted: false,
    }).populate([
      { path: 'user', select: 'name email avater' },
      { path: 'product', select: 'name price, images' },
    ]);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.json({ results: review });
  }

  // Approve or disapprove a review - ADMIN ONLY
  static async toggleReviewApproval(req, res) {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    review.isApproved = !review.isApproved;
    await review.save();

    return res.json(
      resSuccessObject({
        message: `Review ${review.isApproved ? 'approved' : 'disapproved'}`,
        results: review,
      })
    );
  }

  // Delete review - AUTHENTICATED USERS (own reviews) or ADMIN
  static async deleteReview(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdminUser = req.user.role === 'admin' || req.user.isAdmin;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID',
      });
    }

    const review = await Review.findById(id);

    if (!review || review.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Review not found or already deleted',
      });
    }

    // Check if user owns the review or is admin
    if (review.user.toString() !== userId && !isAdminUser) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    review.isDeleted = true;
    await review.save();

    return res.json({ message: 'Review deleted (soft delete)' });
  }

  // Get average rating for a product - PUBLIC ACCESS
  static async getAverageRating(req, res) {
    const { id: productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const stats = await Review.aggregate([
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
    ]);

    const result = stats[0] || { avgRating: 0, totalReviews: 0 };

    res.json(resSuccessObject({ results: result }));
  }
}

module.exports = ReviewController;
