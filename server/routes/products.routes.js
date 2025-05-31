const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/product.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  authenticate,
  adminOrVendor,
  isVendor,
} = require('../middlewares/authMiddleware');

// Public routes
router
  .route('/')
  .get(asyncHandler(ProductsController.getAllProducts)) // Public: Get all products
  .post(authenticate, isVendor, asyncHandler(ProductsController.createProduct)); // Vendor only: Create product

// Vendor-specific routes
router
  .route('/my-products')
  .get(
    authenticate,
    isVendor,
    asyncHandler(ProductsController.getVendorProducts)
  ); // Vendor only: Get own products

// Product-specific routes
router
  .route('/:id')
  .get(asyncHandler(ProductsController.getProductById)) // Public: Get single product
  .put(
    authenticate,
    adminOrVendor,
    asyncHandler(ProductsController.updateProduct)
  ) // Admin or Vendor: Update product
  .delete(
    authenticate,
    adminOrVendor,
    asyncHandler(ProductsController.deleteProduct)
  ); // Admin or Vendor: Delete product

module.exports = router;
