const Review = require('../models/review.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');

class ReviewController {
  // Create a new review - AUTHENTICATED USERS ONLY
  static async createReview(req, res) {
    const { product, rating, comment } = req.body;
    const user = req.user.id;

    // Validate required fields
    if (!product || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: product, rating',
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Validate product ID format
    if (!mongoose.Types.ObjectId.isValid(product)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    // Verify product exists
    const productExist = await Product.findById(product);
    if (!productExist) {
      return res.status(400).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if product is already reviewed by this user
    const existingReview = await Review.findOne({
      product,
      user: user,
      isDeleted: false,
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment || '';
      existingReview.isApproved = false; // re-approval needed

      await existingReview.save();

      // Populate user and product details for response
      await existingReview.populate([
        { path: 'user', select: 'name email' },
        { path: 'product', select: 'name price' },
      ]);

      return res.json({
        success: true,
        message: 'Review updated successfully',
        data: existingReview,
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

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
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

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Cap at 100

    // Build filter object
    const filter = { isDeleted: isDeleted === 'true' };

    // Validate ObjectId fields
    if (product) {
      if (!mongoose.Types.ObjectId.isValid(product)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID format',
        });
      }
      filter.product = product;
    }

    if (user) {
      if (!mongoose.Types.ObjectId.isValid(user)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format',
        });
      }
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

    // Build sort object - validate sortBy field
    const allowedSortFields = ['createdAt', 'updatedAt', 'rating'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sort = {};
    sort[sortField] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate([
          { path: 'user', select: 'name email avatar' }, // Fixed typo: avater -> avatar
          { path: 'product', select: 'name price images' },
        ])
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments(filter),
    ]);

    res.json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: reviews,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalReviews: total,
        hasNextPage: skip + reviews.length < total,
        hasPrevPage: pageNum > 1,
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
      { path: 'user', select: 'name email avatar' }, // Fixed typo: avater -> avatar
      { path: 'product', select: 'name price images' },
    ]);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.json({
      success: true,
      message: 'Review retrieved successfully',
      data: review,
    });
  }

  // Approve or disapprove a review - ADMIN ONLY
  static async toggleReviewApproval(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review ID',
      });
    }

    const review = await Review.findOne({
      _id: id,
      isDeleted: false, // Only allow approval of non-deleted reviews
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    review.isApproved = !review.isApproved;
    await review.save();

    res.json({
      success: true,
      message: `Review ${
        review.isApproved ? 'approved' : 'disapproved'
      } successfully`,
      data: review,
    });
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

    const review = await Review.findOne({
      _id: id,
      isDeleted: false, // Only find non-deleted reviews
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
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

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
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
          ratingBreakdown: {
            $push: '$rating',
          },
        },
      },
      {
        $addFields: {
          avgRating: { $round: ['$avgRating', 2] }, // Round to 2 decimal places
        },
      },
    ]);

    const result = stats[0] || { avgRating: 0, totalReviews: 0 };

    // Remove the ratingBreakdown from the final result if it exists
    if (result.ratingBreakdown) {
      delete result.ratingBreakdown;
    }

    res.json({
      success: true,
      message: 'Average rating retrieved successfully',
      data: result,
    });
  }

  // Get review statistics - ADMIN ACCESS
  static async getReviewStats(req, res) {
    const stats = await Review.aggregate([
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
          averageRating: { $round: ['$averageRating', 2] }, // Round to 2 decimal places
        },
      },
    ]);

    const result = stats[0] || {
      totalReviews: 0,
      approvedReviews: 0,
      pendingReviews: 0,
      averageRating: 0,
      rating1: 0,
      rating2: 0,
      rating3: 0,
      rating4: 0,
      rating5: 0,
    };

    res.json({
      success: true,
      message: 'Review statistics retrieved successfully',
      data: result,
    });
  }
}

module.exports = ReviewController;
