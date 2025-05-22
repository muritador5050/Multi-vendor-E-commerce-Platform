const express = require('express');
const router = express.Router();
const category = require('../controllers/category.controller');
const { asyncHandler } = require('../utils/asyncHandler');

//Routes
router
  .route('/')
  .post(asyncHandler(category.createCategory))
  .get(asyncHandler(category.getAllCategories));
router.get('/tree', asyncHandler(category.getCategoryTree)); // optional

router
  .route('/:id')
  .get(asyncHandler(category.getCategoryById))
  .put(asyncHandler(category.updateCategory))
  .delete(asyncHandler(category.deleteCategory));

module.exports = router;
