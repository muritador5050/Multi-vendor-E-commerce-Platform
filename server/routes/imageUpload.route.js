const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple } = require('../utils/imageUpload');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  authenticate,
  adminOrVendor,
  isAdmin,
} = require('../middlewares/authMiddleware');
const { validateImageUpload } = require('../middlewares/validation.middleware');
const UploadController = require('../controllers/imageUpload.controller');

// Upload single image (e.g category)
router.post(
  '/:type/:id/image',
  uploadSingle,
  authenticate,
  adminOrVendor,
  validateImageUpload,
  asyncHandler(UploadController.uploadImage)
);

// Upload multiple images (e.g., product)
router.post(
  '/:type/:id/images',
  uploadMultiple,
  authenticate,
  adminOrVendor,
  asyncHandler(UploadController.uploadMultipleImages)
);

// Replace existing image
router.put(
  '/:type/:id/image',
  uploadSingle,
  authenticate,
  adminOrVendor,
  validateImageUpload,
  asyncHandler(UploadController.replaceImage)
);

// Delete image
router.delete(
  '/:type/:id/image',
  authenticate,
  isAdmin,
  asyncHandler(UploadController.deleteImage)
);

module.exports = router;
