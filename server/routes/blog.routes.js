const BlogController = require('../controllers/blog.controller');
const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middlewares/authMiddleware');
router.use(authenticate);

router
  .route('/')
  .post(asyncHandler(BlogController.createBlog))
  .get(asyncHandler(BlogController.getBlogs));

router
  .route('/:slug')
  .get(asyncHandler(BlogController.getBlogBySlug))
  .delete(asyncHandler(BlogController.deleteBlog))
  .put(asyncHandler(BlogController.updateBlog));

module.exports = router;
