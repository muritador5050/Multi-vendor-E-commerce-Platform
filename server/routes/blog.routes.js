const BlogController = require('../controllers/blog.controller');
const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middlewares/authMiddleware');
const { blogImageUpload, handleUploadError } = require('../utils/FileUploads');

// Public routes (no authentication required)
router.get('/', asyncHandler(BlogController.getBlogs));
router.get('/:slug', asyncHandler(BlogController.getBlogBySlug));
router.get('/author/:author', asyncHandler(BlogController.getBlogsByAuthor));

// Protected routes (authentication required)
router.use(authenticate);

router.post('/', asyncHandler(BlogController.createBlog));
router.post('/upload-image', (req, res, next) => {
  blogImageUpload.single('blogImage')(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    next();
  });
  asyncHandler(BlogController.uploadBlogImage);
});
router.delete('/delete-image', asyncHandler(BlogController.deleteBlogImage));
router.put('/:slug', asyncHandler(BlogController.updateBlog));
router.delete('/:slug', asyncHandler(BlogController.deleteBlog));
router.patch('/:slug/publish', asyncHandler(BlogController.togglePublish));

module.exports = router;
