const BlogController = require('../controllers/blog.controller');
const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const { blogImageUpload, handleUploadError } = require('../utils/FileUploads');

// Public routes
router.get('/', asyncHandler(BlogController.getBlogs));
router.get('/:id', asyncHandler(BlogController.getBlogById));
router.use(authenticate);

// Admin-only routes
router.post(
  '/',
  checkRole('admin', 'create'),
  (req, res, next) => {
    blogImageUpload.single('blogImage')(req, res, (err) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  asyncHandler(BlogController.createBlog)
);

router.patch(
  '/:id/publish',
  checkRole('admin'),
  asyncHandler(BlogController.togglePublish)
);

router.patch(
  '/:id',
  checkRole('admin', 'edit'),
  blogImageUpload.single('blogImage'),
  asyncHandler(BlogController.updateBlog)
);

router.delete(
  '/:id',
  checkRole('admin'),
  asyncHandler(BlogController.deleteBlog)
);

module.exports = router;
