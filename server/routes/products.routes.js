const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/product.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// Create a new product
router
  .route('/')
  .post(authenticate, isAdmin, asyncHandler(ProductsController.createProduct))
  .get(asyncHandler(ProductsController.getAllProducts));

router
  .route('/:id')
  .get(asyncHandler(ProductsController.getProductById))
  .put(authenticate, isAdmin, asyncHandler(ProductsController.updateProduct))
  .delete(
    authenticate,
    isAdmin,
    asyncHandler(ProductsController.deleteProduct)
  );

module.exports = router;
