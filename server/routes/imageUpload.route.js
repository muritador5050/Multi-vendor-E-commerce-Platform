const express = require('express');
const router = express.Router();
const { upload } = require('../utils/imageUpload');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  authenticate,
  adminOrVendor,
  isAdmin,
} = require('../middlewares/authMiddleware');
const { validateImageUpload } = require('../middlewares/validation.middleware');
const UploadController = require('../controllers/imageUpload.controller');

// Generic upload endpoint for both categories and products
router.post(
  '/:type/:id/image',
  upload.single('image'),
  authenticate,
  adminOrVendor,
  validateImageUpload,
  asyncHandler(UploadController.uploadImage)
);

// Replace existing image
router.put(
  '/:type/:id/image',
  upload.single('image'),
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
