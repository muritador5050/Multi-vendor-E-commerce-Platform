const express = require('express');
const router = express.Router();
const Products = require('../controllers/product.controller');
const { asyncHandler } = require('../utils/asyncHandler');

// Create a new product
router.post('/products', asyncHandler(Products.createProduct));

// Get all products
router.get('/products', asyncHandler(Products.getAllProducts));

// Get a single product by ID
router.get('/products/:id', asyncHandler(Products.getProductById));

// Update a product by ID
router.put('/products/:id', asyncHandler(Products.updateProduct));

// Delete a product by ID
router.delete('/products/:id', asyncHandler(Products.deleteProduct));

module.exports = router;
