const Review = require('../models/review.model');

class ReviewController {
  // Create a new review - AUTHENTICATED USERS ONLY
  static async createReview(req, res) {
    const { product, rating, comment } = req.body;
    const user = req.user.id;

    const { review, isUpdate } = await Review.createOrUpdateReview(
      user,
      product,
      rating,
      comment
    );

    res.status(isUpdate ? 200 : 201).json({
      success: true,
      message: `Review ${isUpdate ? 'updated' : 'created'} successfully`,
      data: review,
    });
  }

  // Get reviews - PUBLIC ACCESS
  static async getReviews(req, res) {
    const { reviews, pagination } = await Review.getReviewsWithPagination(
      req.query
    );

    res.json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: reviews,
      pagination,
    });
  }

  // Get single review - PUBLIC ACCESS
  static async getReviewById(req, res) {
    const { id } = req.params;
    const review = await Review.findReviewById(id);

    res.json({
      success: true,
      message: 'Review retrieved successfully',
      data: review,
    });
  }

  // Approve or disapprove a review - ADMIN ONLY
  static async toggleReviewApproval(req, res) {
    const { id } = req.params;
    const review = await Review.findReviewById(id);
    await review.toggleApproval();

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

    const review = await Review.findReviewById(id);

    if (!review.canBeDeletedBy(userId, isAdminUser)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    await review.softDelete();

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  }

  // Get average rating for a product - PUBLIC ACCESS
  static async getAverageRating(req, res) {
    const { id: productId } = req.params;
    const result = await Review.getAverageRating(productId);

    res.json({
      success: true,
      message: 'Average rating retrieved successfully',
      data: result,
    });
  }

  // Get review statistics - ADMIN ACCESS
  static async getReviewStats(req, res) {
    const result = await Review.getStats();

    res.json({
      success: true,
      message: 'Review statistics retrieved successfully',
      data: result,
    });
  }
}

module.exports = ReviewController;
