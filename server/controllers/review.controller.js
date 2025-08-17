const Review = require('../models/review.model');

class ReviewController {
  // Create a new review - AUTHENTICATED USERS ONLY
  static async createReview(req, res) {
    try {
      const { productId, rating, comment } = req.body;
      const userId = req.user.id;

      const { review, isUpdate } = await Review.createOrUpdateReview(
        userId,
        productId,
        rating,
        comment
      );

      res.status(isUpdate ? 200 : 201).json({
        success: true,
        message: `Review ${isUpdate ? 'updated' : 'created'} successfully`,
        data: review,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get reviews - PUBLIC ACCESS
  static async getReviews(req, res) {
    try {
      const result = await Review.getReviewsWithPagination(req.query);

      res.json({
        success: true,
        message: 'Reviews retrieved successfully',
        data: {
          reviews: result.reviews,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get single review - PUBLIC ACCESS
  static async getReviewById(req, res) {
    try {
      const { id } = req.params;
      const review = await Review.findReviewById(id);

      res.json({
        success: true,
        message: 'Review retrieved successfully',
        data: review,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Approve or disapprove a review - ADMIN ONLY
  static async toggleReviewApproval(req, res) {
    try {
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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete review - AUTHENTICATED USERS (own reviews) or ADMIN
  static async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdminUser = req.user.role === 'admin';

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
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get average rating for a product - PUBLIC ACCESS
  static async getAverageRating(req, res) {
    try {
      const { id: productId } = req.params;
      const result = await Review.getAverageRating(productId);

      res.json({
        success: true,
        message: 'Average rating retrieved successfully',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getReviewStats(req, res) {
    try {
      const result = await Review.getStats();

      res.json({
        success: true,
        message: 'Review statistics retrieved successfully',
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = ReviewController;
