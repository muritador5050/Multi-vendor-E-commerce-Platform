const Blog = require('../models/blog.model');
const User = require('../models/user.model');
const slugify = require('slugify'); // Remove destructuring since slugify is not an object

class BlogController {
  static async createBlog(req, res) {
    try {
      const {
        title,
        content,
        image,
        author,
        tags,
        published = false,
      } = req.body;

      // Validate required fields
      if (!title || !content || !author) {
        return res.status(400).json({
          message: 'Title, content, and author are required',
        });
      }

      const slug = slugify(title, { lower: true, strict: true });

      // Check if slug already exists
      const existingBlog = await Blog.findOne({ slug });
      if (existingBlog) {
        return res.status(409).json({
          message: 'A blog with this title already exists',
        });
      }

      const blog = new Blog({
        title,
        slug,
        content,
        image,
        author,
        tags: tags || [],
        published,
      });

      await blog.save();
      res.status(201).json({
        message: 'Blog created successfully',
        data: blog,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: 'A blog with this title already exists',
        });
      }
      res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
    }
  }

  static async getBlogs(req, res) {
    try {
      const {
        published,
        author,
        tags,
        page = 1,
        limit = 10,
        search,
      } = req.query;

      // Build query object
      const query = {};

      if (published !== undefined) {
        query.published = published === 'true';
      }

      if (author) {
        query.author = author;
      }

      if (tags) {
        query.tags = { $in: tags.split(',') };
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (page - 1) * limit;
      const blogs = await Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('relatedProducts', 'name price image');

      const total = await Blog.countDocuments(query);

      res.status(200).json({
        data: blogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
    }
  }

  static async getBlogBySlug(req, res) {
    try {
      const { slug } = req.params;
      const blog = await Blog.findOne({ slug }).populate(
        'relatedProducts',
        'name price image'
      );

      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      // Increment view count
      blog.views += 1;
      await blog.save();

      res.status(200).json({ data: blog });
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
    }
  }

  static async deleteBlog(req, res) {
    try {
      const { slug } = req.params;
      const deletedBlog = await Blog.findOneAndDelete({ slug });

      if (!deletedBlog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      res.status(200).json({
        message: 'Blog deleted successfully',
        data: deletedBlog,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
    }
  }

  static async updateBlog(req, res) {
    try {
      const { slug } = req.params;
      const { title, content, image, author, tags, published } = req.body;

      const updateData = {};

      if (title) {
        updateData.title = title;
        updateData.slug = slugify(title, { lower: true, strict: true });
      }
      if (content) updateData.content = content;
      if (image !== undefined) updateData.image = image;
      if (author) updateData.author = author;
      if (tags) updateData.tags = tags;
      if (published !== undefined) updateData.published = published;

      // Check if new slug conflicts with existing blog
      if (updateData.slug && updateData.slug !== slug) {
        const existingBlog = await Blog.findOne({ slug: updateData.slug });
        if (existingBlog) {
          return res.status(409).json({
            message: 'A blog with this title already exists',
          });
        }
      }

      const updatedBlog = await Blog.findOneAndUpdate({ slug }, updateData, {
        new: true,
        runValidators: true,
      }).populate('relatedProducts', 'name price image');

      if (!updatedBlog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      res.status(200).json({
        message: 'Blog updated successfully',
        data: updatedBlog,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: 'A blog with this title already exists',
        });
      }
      res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
    }
  }

  static async getBlogsByAuthor(req, res) {
    try {
      const { author } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const skip = (page - 1) * limit;
      const blogs = await Blog.find({ author })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('relatedProducts', 'name price image');

      const total = await Blog.countDocuments({ author });

      if (blogs.length === 0) {
        return res.status(404).json({
          message: 'No blogs found for this author',
        });
      }

      res.status(200).json({
        data: blogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
    }
  }

  static async togglePublish(req, res) {
    try {
      const { slug } = req.params;
      const blog = await Blog.findOne({ slug });

      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      blog.published = !blog.published;
      await blog.save();

      res.status(200).json({
        message: `Blog ${
          blog.published ? 'published' : 'unpublished'
        } successfully`,
        data: blog,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
    }
  }
}

module.exports = BlogController;
