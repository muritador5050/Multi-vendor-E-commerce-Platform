const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple } = require('../utils/imageUpload');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateImageUpload } = require('../middlewares/validation.middleware');
const UploadController = require('../controllers/imageUpload.controller');

/**
 * @openapi
 * tags:
 *   name: Image Upload
 *   description: API endpoints for uploading and managing images
 */
router.post(
  '/:type/:id/image',
  uploadSingle,
  authenticate,
  validateImageUpload,
  asyncHandler(UploadController.uploadImage)
);

/**
 * @openapi
 * /image-upload/{type}/{id}/images:
 *   post:
 *     summary: Upload multiple images for a specific type and ID
 *     tags: [ImageUpload]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of entity (e.g., product, user)
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the entity to upload images for
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '201':
 *         description: Images uploaded successfully
 */
router.post(
  '/:type/:id/images',
  uploadMultiple,
  authenticate,

  asyncHandler(UploadController.uploadMultipleImages)
);

/**
 * @openapi
 * /image-upload/{type}/{id}/image:
 *   put:
 *     summary: Replace an existing image for a specific type and ID
 *     tags: [ImageUpload]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of entity (e.g., product, user)
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the entity to replace the image for
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Image replaced successfully
 */
router.put(
  '/:type/:id/image',
  uploadSingle,
  authenticate,

  validateImageUpload,
  asyncHandler(UploadController.replaceImage)
);

/**
 * @openapi
 * /image-upload/{type}/{id}/image:
 *   delete:
 *     summary: Delete an image for a specific type and ID
 *     tags: [ImageUpload]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: The type of entity (e.g., product, user)
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the entity to delete the image for
 *     responses:
 *       '204':
 *         description: Image deleted successfully
 */
router.delete(
  '/:type/:id/image',
  authenticate,

  asyncHandler(UploadController.deleteImage)
);

module.exports = router;
