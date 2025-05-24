const express = require('express');
const router = express.Router();
const { upload } = require('../utils/imageUpload');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateImageUpload } = require('../middlewares/validation.middleware');
const UploadController = require('../controllers/imageUpload.controller');

//Upload enpoint
router.post(
  '/categories/:id/image',
  upload.single('image'),
  authenticate,
  validateImageUpload,
  asyncHandler(UploadController.uploadImage)
);
