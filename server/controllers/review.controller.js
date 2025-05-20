const Review_model = require('../models/review.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');
const { resSuccessObject } = require('../utils/responseObject');

class Review {
  // Create a new review
  static async createReview(req, res) {
    const { product, rating, comment } = req.body;
    const user = req.user._id;

    // Check if product is already reviewed
    const existingReview = await Review_model.findOne({
      product,
      user: user,
      isDeleted: false,
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.isApproved = false; // re-approval needed
      await existingReview.save();
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

    const review = await Review_model.create({
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
      Review_model.find(filter)
        .populate('user', 'name email avatar')
        .populate('product', 'name price images')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Review_model.countDocuments(filter),
    ]);

    // FIX: Use 'total' instead of 'totalCount'
    const totalPages = Math.ceil(total / parseInt(limit));

    // FIX: Correct response structure
    res.json(
      resSuccessObject({
        results: reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      })
    );
  }

  static async getReviewById(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID',
      });
    }

    // FIX: Use Review_model instead of Review
    const review = await Review_model.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate('user', 'name email avatar')
      .populate('product', 'name price images');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.json(
      resSuccessObject({
        results: review,
      })
    );
  }

  // Approve or disapprove a review (Admin only)
  static async toggleReviewApproval(req, res) {
    // FIX: Parameter name should match route (:id)
    const { id } = req.params;
    const review = await Review_model.findById(id);

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

  static async deleteReview(req, res) {
    // FIX: Parameter name should match route (:Id -> :id for consistency)
    const { id } = req.params;
    const review = await Review_model.findById(id);

    if (!review || review.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Review not found or already deleted',
      });
    }

    review.isDeleted = true;
    await review.save();

    return res.json(
      resSuccessObject({
        message: 'Review deleted (soft delete)',
        results: review,
      })
    );
  }

  // Get average rating for a product
  static async getAverageRating(req, res) {
    // FIX: Parameter name should match route (:Id -> :productId)
    const { productId } = req.params;

    const stats = await Review_model.aggregate([
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

module.exports = Review;
