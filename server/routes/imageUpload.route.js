const express = require('express');
const router = express.Router();
const { upload } = require('../utils/imageUpload');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateImageUpload } = require('../middlewares/validation.middleware');
const UploadController = require('../controllers/imageUpload.controller');

// Generic upload endpoint for both categories and products
router.post(
  '/:type/:id/image',
  upload.single('image'),
  authenticate,
  validateImageUpload,
  asyncHandler(UploadController.uploadImage)
);

// Replace existing image
router.put(
  '/:type/:id/image',
  upload.single('image'),
  authenticate,
  validateImageUpload,
  asyncHandler(UploadController.replaceImage)
);

// Delete image
router.delete(
  '/:type/:id/image',
  authenticate,
  asyncHandler(UploadController.deleteImage)
);

module.exports = router;
