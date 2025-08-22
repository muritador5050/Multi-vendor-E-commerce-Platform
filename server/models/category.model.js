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

// Instance method to get products with pagination
categorySchema.methods.getProductsWithPagination = async function (
  options = {}
) {
  const { page = 1, limit = 10 } = options;
  const Product = mongoose.model('Product');

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const parsedLimit = parseInt(limit);

  const [products, totalProducts] = await Promise.all([
    Product.find({
      category: this._id,
      isDeleted: false,
      isActive: true,
    })
      .sort('-createdAt')
      .skip(skip)
      .limit(parsedLimit)
      .populate('vendor', 'name')
      .lean(),
    Product.countDocuments({
      category: this._id,
      isDeleted: false,
      isActive: true,
    }),
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
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Static method to create single category with validation
categorySchema.statics.createWithValidation = async function (categoryData) {
  const { name, image } = categoryData;

  if (!name) {
    throw new Error('Category name is required');
  }

  const existingCategory = await this.findOne({ name });
  if (existingCategory) {
    throw new Error(`Category ${name} already exists`);
  }

  return await this.create({
    name,
    image,
    slug: slugify(name, { lower: true, strict: true }),
  });
};

// Static method to create bulk categories with validation
categorySchema.statics.createBulkWithValidation = async function (categories) {
  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error('Categories must be a non-empty array');
  }

  // Validate each category has a name
  for (const category of categories) {
    if (!category.name?.trim()) {
      throw new Error('Each category must have a valid name');
    }
  }

  // Check for existing categories
  const categoryNames = categories.map((c) => c.name);
  const existingCategories = await this.find({
    name: { $in: categoryNames },
  });

  if (existingCategories.length > 0) {
    throw new Error(
      `Some categories already exist: ${existingCategories
        .map((e) => e.name)
        .join(', ')}`
    );
  }

  // Create categories with slugs
  return await this.insertMany(
    categories.map((c) => ({
      ...c,
      slug: slugify(c.name, { lower: true, strict: true }),
    }))
  );
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

// Static method to find by slug with products
categorySchema.statics.findBySlugWithProducts = async function (
  slug,
  options = {}
) {
  const { includeProducts = false, page = 1, limit = 10 } = options;

  if (!slug) {
    throw new Error('Slug parameter is required');
  }

  const category = await this.findOne({ slug });
  if (!category) {
    throw new Error('Category not found');
  }

  if (!includeProducts) {
    return category;
  }

  const productData = await category.getProductsWithPagination({ page, limit });
  const categoryData = category.toObject();

  return {
    ...categoryData,
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
  if (!this.isValidObjectId(id)) {
    throw new Error('Invalid category ID format');
  }

  const category = await this.findById(id);
  if (!category) {
    throw new Error('Category not found');
  }

  // Check for name conflicts
  if (updateData.name && updateData.name !== category.name) {
    const existingCategory = await this.findOne({
      name: updateData.name,
      _id: { $ne: id },
    });
    if (existingCategory) {
      throw new Error('Category name already exists');
    }
    updateData.slug = slugify(updateData.name, { lower: true, strict: true });
  }

  return await this.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

module.exports = mongoose.model('Category', categorySchema);
