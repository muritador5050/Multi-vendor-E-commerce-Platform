const mongoose = require('mongoose');

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
      type: String, // Keep as String to match your controller
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

module.exports = mongoose.model('Blog', blogSchema);
