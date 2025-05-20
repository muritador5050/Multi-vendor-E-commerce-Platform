const express = require('express');
const router = express.Router();
const category = require('../controllers/category.controller');
const { asyncHandler } = require('../utils/asyncHandler');

//Routes
router.post('/categories', asyncHandler(category.createCategory));
router.get('/categories', asyncHandler(category.getAllCategories));
router.get('/categories/tree', asyncHandler(category.getCategoryTree)); // optional
router.get('/categories/:id', asyncHandler(category.getCategoryById));
router.put('/categories/:id', asyncHandler(category.updateCategory));
router.delete('/categories/:id', asyncHandler(category.deleteCategory));

module.exports = router;
