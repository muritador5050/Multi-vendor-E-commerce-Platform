const Blog = require('../models/blog.model');
const User = require('../models/user.model');
const { slugify } = require('slugify');

class BlogController {
  static async createBlog(req, res) {
    try {
      const { title, content, image, author, tags } = req.body;
      const slug = slugify(title, { lower: true });
      const blog = new Blog({ title, slug, content, image, author, tags });
      await blog.save();
      res
        .status(201)
        .json({ message: 'Blog created successfully', data: blog });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static async getBlogs(req, res) {
    try {
      const blogs = await Blog.find().sort({ createdAt: -1 });
      res.status(200).json({ data: blogs });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static async getBlogBySlug(req, res) {
    try {
      const { slug } = req.params;
      const blog = await Blog.findOne({ slug }).populate('relatedProducts');
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      res.status(200).json({ data: blog });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static async deleteBlog(req, res) {
    try {
      const { slug } = req.params;
      const deletedBlog = await Blog.findOneAndDelete({ slug });
      if (!deletedBlog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static async updateBlog(req, res) {
    try {
      const { slug } = req.params;
      const { title, content, image, author, tags } = req.body;
      const updatedBlog = await Blog.findOneAndUpdate(
        { slug },
        {
          title,
          content,
          image,
          author,
          tags,
          slug: slugify(title, { lower: true }),
        },
        { new: true }
      );
      if (!updatedBlog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      res
        .status(200)
        .json({ message: 'Blog updated successfully', data: updatedBlog });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  static async getBlogsByAuthor(req, res) {
    try {
      const { author } = req.params;
      const blogs = await Blog.find({ author }).sort({ createdAt: -1 });
      if (blogs.length === 0) {
        return res
          .status(404)
          .json({ message: 'No blogs found for this author' });
      }
      res.status(200).json({ data: blogs });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = BlogController;
