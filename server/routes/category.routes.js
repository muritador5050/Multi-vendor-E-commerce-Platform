const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  authenticate,
  isAdmin,
  isVendor,
} = require('../middlewares/authMiddleware');

//Routes
router
  .route('/')
  .post(
    authenticate,
    isVendor,
    isAdmin,
    asyncHandler(CategoryController.createCategory)
  )
  .get(
    authenticate,
    isAdmin,
    isVendor,
    asyncHandler(CategoryController.getAllCategories)
  );
router.get(
  '/tree',
  authenticate,
  isAdmin,
  asyncHandler(CategoryController.getCategoryTree)
); // optional

router
  .route('/:id')
  .get(
    authenticate,
    isAdmin,
    isVendor,
    asyncHandler(CategoryController.getCategoryById)
  )
  .put(authenticate, isVendor, asyncHandler(CategoryController.updateCategory))
  .delete(
    authenticate,
    isAdmin,
    isVendor,
    asyncHandler(CategoryController.deleteCategory)
  );

module.exports = router;
