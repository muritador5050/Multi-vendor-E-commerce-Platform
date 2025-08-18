const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
    },
    excerpt: {
      type: String,
      maxlength: 300,
    },
    image: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 10;
        },
        message: 'Maximum 10 tags allowed',
      },
      set: function (tags) {
        return tags.map((tag) => tag.toLowerCase().trim());
      },
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
blogSchema.index({ published: 1, createdAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ author: 1 });

// Virtual for reading time
blogSchema.virtual('readingTime').get(function () {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Pre-save middleware
blogSchema.pre('save', function (next) {
  if (this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  } else if (!this.published) {
    this.publishedAt = null;
  }

  // Generate slug if title is modified
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  next();
});

// Static methods
blogSchema.statics.createBlog = async function (blogData) {
  const { title, content, author, tags, published = false, image } = blogData;

  if (!title || !content || !author || !image) {
    const error = new Error('Title, content, author, and image are required');
    error.statusCode = 400;
    throw error;
  }

  const blog = new this({
    title,
    content,
    image,
    author,
    tags: tags || [],
    published,
  });

  return await blog.save();
};

blogSchema.statics.getBlogs = async function (queryParams) {
  const { published, author, tags, page = 1, limit = 10, search } = queryParams;
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

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [blogs, total] = await Promise.all([
    this.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    this.countDocuments(query),
  ]);

  return {
    blogs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

blogSchema.statics.findByIdAndIncrementViews = async function (id) {
  const blog = await this.findById(id);
  if (!blog) {
    const error = new Error('Blog not found');
    error.statusCode = 404;
    throw error;
  }
  blog.views += 1;
  await blog.save();
  return blog;
};

blogSchema.statics.updateById = async function (id, updateData) {
  const blog = await this.findById(id);
  if (!blog) {
    const error = new Error('Blog not found');
    error.statusCode = 404;
    throw error;
  }

  // Update fields
  Object.keys(updateData).forEach((key) => {
    if (key !== '_id') {
      blog[key] = updateData[key];
    }
  });

  return await blog.save();
};

blogSchema.statics.deleteById = async function (id) {
  const blog = await this.findByIdAndDelete(id);
  if (!blog) {
    const error = new Error('Blog not found');
    error.statusCode = 404;
    throw error;
  }
  return blog;
};

blogSchema.methods.togglePublished = async function () {
  this.published = !this.published;
  this.publishedAt = this.published ? new Date() : null;
  await this.save();
  return this;
};

module.exports = mongoose.model('Blog', blogSchema);
