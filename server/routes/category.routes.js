const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  authenticate,
  isVendor,
  adminOrVendor,
} = require('../middlewares/authMiddleware');

//Routes
router
  .route('/')
  .post(authenticate, isVendor, asyncHandler(CategoryController.createCategory))
  .get(
    authenticate,
    adminOrVendor,
    asyncHandler(CategoryController.getAllCategories)
  );
router.get(
  '/tree',
  authenticate,
  adminOrVendor,
  asyncHandler(CategoryController.getCategoryTree)
); // optional

router
  .route('/:id')
  .get(
    authenticate,
    adminOrVendor,
    asyncHandler(CategoryController.getCategoryById)
  )
  .put(authenticate, isVendor, asyncHandler(CategoryController.updateCategory))
  .delete(
    authenticate,
    adminOrVendor,
    asyncHandler(CategoryController.deleteCategory)
  );

module.exports = router;
