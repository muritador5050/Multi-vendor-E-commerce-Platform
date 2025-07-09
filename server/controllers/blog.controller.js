const Blog = require('../models/blog.model');
const slugify = require('slugify');

class BlogController {
  static async createBlog(req, res) {
    const { title, content, image, author, tags, published = false } = req.body;

    if (!title || !content || !author) {
      res.status(400);
      throw new Error('Title, content, and author are required');
    }

    const slug = slugify(title, { lower: true, strict: true });
    const existingBlog = await Blog.findOne({ slug });

    if (existingBlog) {
      res.status(409);
      throw new Error('A blog with this title already exists');
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
  }

  static async getBlogs(req, res) {
    const { published, author, tags, page = 1, limit = 10, search } = req.query;

    const query = {};

    if (published !== undefined) query.published = published === 'true';
    if (author) query.author = author;
    if (tags) query.tags = { $in: tags.split(',') };
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
  }

  static async getBlogBySlug(req, res) {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug }).populate(
      'relatedProducts',
      'name price image'
    );

    if (!blog) {
      res.status(404);
      throw new Error('Blog not found');
    }

    blog.views += 1;
    await blog.save();

    res.status(200).json({ data: blog });
  }

  static async deleteBlog(req, res) {
    const { slug } = req.params;

    const deletedBlog = await Blog.findOneAndDelete({ slug });

    if (!deletedBlog) {
      res.status(404);
      throw new Error('Blog not found');
    }

    res.status(200).json({
      message: 'Blog deleted successfully',
      data: deletedBlog,
    });
  }

  static async updateBlog(req, res) {
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

    if (updateData.slug && updateData.slug !== slug) {
      const existingBlog = await Blog.findOne({ slug: updateData.slug });
      if (existingBlog) {
        res.status(409);
        throw new Error('A blog with this title already exists');
      }
    }

    const updatedBlog = await Blog.findOneAndUpdate({ slug }, updateData, {
      new: true,
      runValidators: true,
    }).populate('relatedProducts', 'name price image');

    if (!updatedBlog) {
      res.status(404);
      throw new Error('Blog not found');
    }

    res.status(200).json({
      message: 'Blog updated successfully',
      data: updatedBlog,
    });
  }

  static async getBlogsByAuthor(req, res) {
    const { author } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ author })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedProducts', 'name price image');

    const total = await Blog.countDocuments({ author });

    if (!blogs.length) {
      res.status(404);
      throw new Error('No blogs found for this author');
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
  }

  static async togglePublish(req, res) {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug });

    if (!blog) {
      res.status(404);
      throw new Error('Blog not found');
    }

    blog.published = !blog.published;
    await blog.save();

    res.status(200).json({
      message: `Blog ${
        blog.published ? 'published' : 'unpublished'
      } successfully`,
      data: blog,
    });
  }
}

module.exports = BlogController;
