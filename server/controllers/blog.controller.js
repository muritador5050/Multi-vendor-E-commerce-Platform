const Blog = require('../models/blog.model');
const path = require('path');
const {
  blogImageUpload,
  handleUploadError,
  uploadResponse,
  deleteFile,
} = require('../utils/FileUploads');

class BlogController {
  static async createBlog(req, res) {
    const blog = await Blog.createBlog(req.body);

    res.status(201).json({
      message: 'Blog created successfully',
      data: blog,
    });
  }

  static async getBlogs(req, res) {
    const result = await Blog.getBlogs(req.query);

    res.status(200).json({
      data: result.blogs,
      pagination: result.pagination,
    });
  }

  static async getBlogBySlug(req, res) {
    const blog = await Blog.findBySlugAndIncrementViews(req.params.slug);

    res.status(200).json({ data: blog });
  }

  static async deleteBlog(req, res) {
    const deletedBlog = await Blog.deleteBySlug(req.params.slug);

    res.status(200).json({
      message: 'Blog deleted successfully',
      data: deletedBlog,
    });
  }

  static async updateBlog(req, res) {
    const updatedBlog = await Blog.updateBySlug(req.params.slug, req.body);

    res.status(200).json({
      message: 'Blog updated successfully',
      data: updatedBlog,
    });
  }

  static async getBlogsByAuthor(req, res) {
    const result = await Blog.getBlogsByAuthor(req.params.author, req.query);

    res.status(200).json({
      data: result.blogs,
      pagination: result.pagination,
    });
  }

  static async togglePublish(req, res) {
    const blog = await Blog.findBySlugForToggle(req.params.slug);
    const updatedBlog = await blog.togglePublished();

    res.status(200).json({
      message: `Blog ${
        updatedBlog.published ? 'published' : 'unpublished'
      } successfully`,
      data: updatedBlog,
    });
  }

  // Upload blog image
  static async uploadBlogImage(req, res) {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const imagePath = `uploads/blogs/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Blog image uploaded successfully',
      data: {
        filename: req.file.filename,
        path: imagePath,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  }

  // Delete blog image
  static async deleteBlogImage(req, res) {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required',
      });
    }

    const filePath = path.join(__dirname, '..', 'uploads/blogs', filename);
    const result = await deleteFile(filePath);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Blog image deleted successfully',
      });
    } else {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }
  }
}

module.exports = BlogController;
