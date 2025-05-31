const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  authenticate,
  isVendor,
  isAdmin,
  adminOrVendor,
} = require('../middlewares/authMiddleware');

// PUBLIC ROUTES - No authentication required
router.get('/', asyncHandler(CategoryController.getAllCategories));
router.get('/:slug', asyncHandler(CategoryController.getCategoryBySlug));

// ADMIN ONLY ROUTES - Category management is typically admin responsibility
router.post(
  '/',
  authenticate,
  isAdmin,
  asyncHandler(CategoryController.createCategory)
);

// Only admins can delete categories (major structural change)
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(CategoryController.deleteCategory)
);

// ADMIN OR VENDOR ROUTES
router.get(
  '/:id',
  authenticate,
  adminOrVendor,
  asyncHandler(CategoryController.getCategoryById)
);

// Both can update category details (like images, descriptions)
router.put(
  '/:id',
  authenticate,
  adminOrVendor,
  asyncHandler(CategoryController.updateCategory)
);

module.exports = router;
