const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/product.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  authenticate,
  isAdmin,
  adminOrVendor,
  isVendor,
} = require('../middlewares/authMiddleware');

// Create a new product
router
  .route('/')
  .post(authenticate, isVendor, asyncHandler(ProductsController.createProduct))
  .get(asyncHandler(ProductsController.getAllProducts));

router
  .route('/:id')
  .get(asyncHandler(ProductsController.getProductById))
  .put(authenticate, isVendor, asyncHandler(ProductsController.updateProduct))
  .delete(
    authenticate,
    adminOrVendor,
    asyncHandler(ProductsController.deleteProduct)
  );

module.exports = router;
