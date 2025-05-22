const express = require('express');
const router = express.Router();
const Products = require('../controllers/product.controller');
const { asyncHandler } = require('../utils/asyncHandler');

// Create a new product
router
  .route('/')
  .post(asyncHandler(Products.createProduct))
  .get(asyncHandler(Products.getAllProducts));

router
  .route('/:id')
  .get(asyncHandler(Products.getProductById))
  .put(asyncHandler(Products.updateProduct))
  .delete(asyncHandler(Products.deleteProduct));

module.exports = router;
