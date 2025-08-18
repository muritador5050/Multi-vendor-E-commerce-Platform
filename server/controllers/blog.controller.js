const Blog = require('../models/blog.model');
const path = require('path');
const fs = require('fs');
const { BACKEND_URL } = require('../configs/index');

class BlogController {
  static async createBlog(req, res, next) {
    try {
      if (!req.file) {
        const error = new Error('Blog image is required');
        error.statusCode = 400;
        throw error;
      }

      const blogData = {
        ...req.body,
        image: `${BACKEND_URL}/uploads/blogs/${req.file.filename}`,
      };

      const blog = await Blog.createBlog(blogData);

      res.status(201).json({
        success: true,
        message: 'Blog created successfully',
        data: blog,
      });
    } catch (error) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      }
      next(error);
    }
  }

  static async getBlogs(req, res, next) {
    try {
      const result = await Blog.getBlogs(req.query);
      res.status(200).json({
        success: true,
        message: 'Blogs retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBlogById(req, res, next) {
    try {
      const blog = await Blog.findByIdAndIncrementViews(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Blog retrieved successfully',
        data: blog,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateBlog(req, res, next) {
    try {
      const updateData = { ...req.body };

      if (req.file) {
        updateData.image = `${BACKEND_URL}/uploads/blogs/${req.file.filename}`;

        // Delete old image
        const oldBlog = await Blog.findById(req.params.id);
        if (oldBlog?.image) {
          const oldImagePath = oldBlog.image.replace(BACKEND_URL, '');
          fs.unlink(path.join(__dirname, '../', oldImagePath), () => {});
        }
      }

      const updatedBlog = await Blog.updateById(req.params.id, updateData);
      res.status(200).json({
        success: true,
        message: 'Blog updated successfully',
        data: updatedBlog,
      });
    } catch (error) {
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      next(error);
    }
  }

  static async deleteBlog(req, res, next) {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        const error = new Error('Blog not found');
        error.statusCode = 404;
        throw error;
      }

      // Delete associated image file
      if (blog.image) {
        const imagePath = blog.image.replace(BACKEND_URL, '');
        fs.unlink(path.join(__dirname, '../', imagePath), (err) => {
          if (err) console.error('Error deleting blog image:', err);
        });
      }

      await Blog.deleteById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Blog deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async togglePublish(req, res, next) {
    try {
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        const error = new Error('Blog not found');
        error.statusCode = 404;
        throw error;
      }

      const updatedBlog = await blog.togglePublished();
      res.status(200).json({
        success: true,
        message: `Blog ${
          updatedBlog.published ? 'published' : 'unpublished'
        } successfully`,
        data: updatedBlog,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BlogController;
