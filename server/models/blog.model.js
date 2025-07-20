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
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Image must be a valid URL',
      },
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
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
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

// Indexes for better performance
blogSchema.index({ published: 1, createdAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ author: 1 });

// Virtual for reading time estimation
blogSchema.virtual('readingTime').get(function () {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
});

// Pre-save middleware to set publishedAt date
blogSchema.pre('save', function (next) {
  if (this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  } else if (!this.published) {
    this.publishedAt = null;
  }
  next();
});

// STATIC METHODS

// Create a new blog with validation
blogSchema.statics.createBlog = async function (blogData) {
  const { title, content, author, tags, published = false, image } = blogData;

  if (!title || !content || !author) {
    const error = new Error('Title, content, and author are required');
    error.statusCode = 400;
    throw error;
  }

  const slug = slugify(title, { lower: true, strict: true });
  const existingBlog = await this.findOne({ slug });

  if (existingBlog) {
    const error = new Error('A blog with this title already exists');
    error.statusCode = 409;
    throw error;
  }

  const blog = new this({
    title,
    slug,
    content,
    image,
    author,
    tags: tags || [],
    published,
  });

  return await blog.save();
};

// Get blogs with filtering and pagination
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
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedProducts', 'name price image'),
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

// Find blog by slug and increment views
blogSchema.statics.findBySlugAndIncrementViews = async function (slug) {
  const blog = await this.findOne({ slug }).populate(
    'relatedProducts',
    'name price image'
  );

  if (!blog) {
    const error = new Error('Blog not found');
    error.statusCode = 404;
    throw error;
  }

  blog.views += 1;
  await blog.save();

  return blog;
};

// Delete blog by slug
blogSchema.statics.deleteBySlug = async function (slug) {
  const deletedBlog = await this.findOneAndDelete({ slug });

  if (!deletedBlog) {
    const error = new Error('Blog not found');
    error.statusCode = 404;
    throw error;
  }

  return deletedBlog;
};

// Update blog by slug with validation
blogSchema.statics.updateBySlug = async function (slug, updateData) {
  const processedUpdateData = {};

  if (updateData.title) {
    processedUpdateData.title = updateData.title;
    processedUpdateData.slug = slugify(updateData.title, {
      lower: true,
      strict: true,
    });
  }
  if (updateData.content) processedUpdateData.content = updateData.content;
  if (updateData.image !== undefined)
    processedUpdateData.image = updateData.image;
  if (updateData.author) processedUpdateData.author = updateData.author;
  if (updateData.tags) processedUpdateData.tags = updateData.tags;
  if (updateData.published !== undefined)
    processedUpdateData.published = updateData.published;

  // Check for slug conflicts if title is being updated
  if (processedUpdateData.slug && processedUpdateData.slug !== slug) {
    const existingBlog = await this.findOne({ slug: processedUpdateData.slug });
    if (existingBlog) {
      const error = new Error('A blog with this title already exists');
      error.statusCode = 409;
      throw error;
    }
  }

  const updatedBlog = await this.findOneAndUpdate(
    { slug },
    processedUpdateData,
    {
      new: true,
      runValidators: true,
    }
  ).populate('relatedProducts', 'name price image');

  if (!updatedBlog) {
    const error = new Error('Blog not found');
    error.statusCode = 404;
    throw error;
  }

  return updatedBlog;
};

// Get blogs by author with pagination
blogSchema.statics.getBlogsByAuthor = async function (author, queryParams) {
  const { page = 1, limit = 10 } = queryParams;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [blogs, total] = await Promise.all([
    this.find({ author })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedProducts', 'name price image'),
    this.countDocuments({ author }),
  ]);

  if (!blogs.length) {
    const error = new Error('No blogs found for this author');
    error.statusCode = 404;
    throw error;
  }

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

// INSTANCE METHODS

// Toggle published status
blogSchema.methods.togglePublished = async function () {
  this.published = !this.published;
  await this.save();
  return this;
};

// Find blog by slug for toggle operation
blogSchema.statics.findBySlugForToggle = async function (slug) {
  const blog = await this.findOne({ slug });

  if (!blog) {
    const error = new Error('Blog not found');
    error.statusCode = 404;
    throw error;
  }

  return blog;
};

module.exports = mongoose.model('Blog', blogSchema);
