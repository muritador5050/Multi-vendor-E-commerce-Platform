const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * @openapi
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: "60f7b1b5e1b2c3d4e5f6a7b8"
 *         name:
 *           type: string
 *           description: Category name
 *           example: "Electronics"
 *         slug:
 *           type: string
 *           description: URL-friendly version of the name
 *           example: "electronics"
 *         image:
 *           type: string
 *           description: Category image URL
 *           example: "https://example.com/image.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Category creation timestamp
 *           example: "2023-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Category last update timestamp
 *           example: "2023-01-15T10:30:00Z"
 *     CategoryInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Category name
 *           example: "Electronics"
 *         image:
 *           type: string
 *           description: Category image URL
 *           example: "https://example.com/image.jpg"
 *     CategoryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Category created successfully"
 *         data:
 *           $ref: '#/components/schemas/Category'
 *     CategoriesListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "We have 5 categories to choose from."
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 25
 *             pages:
 *               type: integer
 *               example: 3
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *         categories:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "60f7b1b5e1b2c3d4e5f6a7b8"
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *               slug:
 *                 type: string
 *                 example: "electronics"
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-15T10:30:00Z"
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-01-15T10:30:00Z"
 */

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      index: true,
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    image: {
      type: String,
      default: '',
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty string
          // Basic URL validation
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Image must be a valid URL',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Query helper for pagination
categorySchema.query.paginate = function ({ page, limit }) {
  const skip = limit * (page - 1);
  return this.skip(skip).limit(limit);
};

// Search filter query helper
categorySchema.query.searchByText = function (search) {
  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    return this.where({
      $or: [{ name: searchRegex }, { slug: searchRegex }],
    });
  }
  return this;
};

categorySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Auto-generate slug before saving
categorySchema.pre('save', async function (next) {
  if (this.isModified('name') || this.isNew) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });

    if (this.isNew || this.slug !== baseSlug) {
      let slug = baseSlug;
      let counter = 1;

      while (
        await mongoose
          .model('Category')
          .findOne({ slug, _id: { $ne: this._id } })
      ) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      this.slug = slug;
    }
  }
  next();
});

categorySchema.pre('save', function (next) {
  if (this.name) {
    this.name = this.name.trim();
  }
  next();
});

// Instance method to get safe public data
categorySchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    slug: this.slug,
    image: this.image || '/default-images/category-placeholder.jpg',
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Static method to get categories with search and pagination
categorySchema.statics.getWithPagination = async function (options = {}) {
  const { page = 1, limit = 10, search, sort = { name: 1 } } = options;

  const query = this.find().searchByText(search);

  const [categories, total] = await Promise.all([
    query.clone().paginate({ page, limit }).sort(sort),
    query.clone().countDocuments(),
  ]);

  return {
    categories,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
};

module.exports = mongoose.model('Category', categorySchema);
