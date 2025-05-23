const express = require('express');
const router = express.Router();
const category = require('../controllers/category.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

//Routes
router
  .route('/')
  .post(authenticate, isAdmin, asyncHandler(category.createCategory))
  .get(authenticate, isAdmin, asyncHandler(category.getAllCategories));
router.get(
  '/tree',
  authenticate,
  isAdmin,
  asyncHandler(category.getCategoryTree)
); // optional

router
  .route('/:id')
  .get(authenticate, isAdmin, asyncHandler(category.getCategoryById))
  .put(authenticate, isAdmin, asyncHandler(category.updateCategory))
  .delete(authenticate, isAdmin, asyncHandler(category.deleteCategory));

module.exports = router;
