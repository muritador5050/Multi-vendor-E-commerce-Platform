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
 *           example: "Found 5 categories"
 *         data:
 *           type: object
 *           properties:
 *             categories:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
      index: true,
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
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: false },
    toObject: { virtuals: false },
  }
);

// Optimized pre-save hook - combines both name trimming and slug generation
categorySchema.pre('save', async function (next) {
  // Trim name first
  if (this.name) {
    this.name = this.name.trim();
  }

  // Generate slug if name is modified or document is new
  if (this.isModified('name') || this.isNew) {
    const baseSlug = slugify(this.name, { lower: true, strict: true });

    if (this.isNew || this.slug !== baseSlug) {
      this.slug = await this.constructor.generateUniqueSlug(baseSlug, this._id);
    }
  }
  next();
});

// Instance method to get safe public data
categorySchema.methods.toPublicJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    slug: this.slug,
    image: this.image || '/default-images/category-placeholder.jpg',
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Instance method to get products with pagination
categorySchema.methods.getProductsWithPagination = async function (
  options = {}
) {
  const { page = 1, limit = 10 } = options;
  const Product = mongoose.model('Product');

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const parsedLimit = parseInt(limit);

  const query = {
    category: this._id,
    isDeleted: false,
    isActive: true,
  };

  const [products, totalProducts] = await Promise.all([
    Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .populate('vendor', 'name')
      .lean(),
    Product.countDocuments(query),
  ]);

  return {
    products,
    productCount: totalProducts,
    pagination: {
      page: parseInt(page),
      limit: parsedLimit,
      total: totalProducts,
      pages: Math.ceil(totalProducts / parsedLimit),
    },
  };
};

// Instance method to check if category can be deleted
categorySchema.methods.canBeDeleted = async function () {
  const Product = mongoose.model('Product');
  const productCount = await Product.countDocuments({
    category: this._id,
    isDeleted: false,
  });

  return { canDelete: productCount === 0, productCount };
};

// Instance method to delete with product handling
categorySchema.methods.deleteWithProducts = async function (force = false) {
  const Product = mongoose.model('Product');
  const { canDelete, productCount } = await this.canBeDeleted();

  if (!canDelete && !force) {
    throw new Error(
      `Cannot delete category. It has ${productCount} products associated with it. Use force=true to delete anyway.`
    );
  }

  if (force && productCount > 0) {
    await Product.updateMany(
      { category: this._id },
      { $unset: { category: 1 } }
    );
  }

  await this.deleteOne();

  return {
    deleted: true,
    productsUpdated: force ? productCount : 0,
  };
};

// Static method to validate ObjectId
categorySchema.statics.isValidObjectId = function (id) {
  return mongoose.Types.ObjectId.isValid(id);
};

// Static method to generate unique slug (extracted for reusability)
categorySchema.statics.generateUniqueSlug = async function (
  baseSlug,
  excludeId = null
) {
  let slug = baseSlug;
  let counter = 1;

  const query = excludeId ? { slug, _id: { $ne: excludeId } } : { slug };

  while (await this.findOne(query)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    query.slug = slug;
  }

  return slug;
};

// Static method to create single or multiple categories with validation
categorySchema.statics.createCategories = async function (data) {
  const categories = Array.isArray(data) ? data : [data];

  if (categories.length === 0) {
    throw new Error('No categories provided');
  }

  // Validate each category has a name
  for (const category of categories) {
    if (!category.name?.trim()) {
      throw new Error('Each category must have a valid name');
    }
  }

  // Check for existing categories by name
  const categoryNames = categories.map((c) => c.name.trim());
  const existingCategories = await this.find({
    name: { $in: categoryNames },
  }).select('name');

  if (existingCategories.length > 0) {
    const existingNames = existingCategories.map((e) => e.name).join(', ');
    throw new Error(`Categories already exist: ${existingNames}`);
  }

  // For single category, use save() to trigger middleware
  if (!Array.isArray(data)) {
    const category = new this(categories[0]);
    await category.save();
    return category;
  }

  const createdCategories = [];
  for (const categoryData of categories) {
    const category = new this(categoryData);
    await category.save();
    createdCategories.push(category);
  }

  return createdCategories;
};

// Static method to find by slug with products
categorySchema.statics.findBySlugWithProducts = async function (
  slug,
  options = {}
) {
  const { includeProducts = false, page = 1, limit = 10 } = options;

  if (!slug?.trim()) {
    throw new Error('Slug parameter is required');
  }

  const category = await this.findOne({ slug: slug.trim() });
  if (!category) {
    throw new Error('Category not found');
  }

  if (!includeProducts) {
    return category;
  }

  const productData = await category.getProductsWithPagination({ page, limit });

  return {
    ...category.toObject(),
    ...productData,
  };
};

// Static method to find by ID with validation
categorySchema.statics.findByIdWithValidation = async function (id) {
  if (!this.isValidObjectId(id)) {
    throw new Error('Invalid category ID format');
  }

  const category = await this.findById(id);
  if (!category) {
    throw new Error('Category not found');
  }

  return category;
};

// Static method to update with validation
categorySchema.statics.updateWithValidation = async function (id, updateData) {
  const category = await this.findByIdWithValidation(id);

  if (updateData.name && updateData.name.trim() !== category.name) {
    const trimmedName = updateData.name.trim();
    const existingCategory = await this.findOne({
      name: trimmedName,
      _id: { $ne: id },
    });

    if (existingCategory) {
      throw new Error('Category name already exists');
    }
  }

  Object.keys(updateData).forEach((key) => {
    category[key] = updateData[key];
  });

  return await category.save();
};

module.exports = mongoose.model('Category', categorySchema);
