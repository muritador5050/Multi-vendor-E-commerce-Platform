const mongoose = require('mongoose');
const slugify = require('slugify');

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

// Pre-save middleware for slug generation
categorySchema.pre('save', async function (next) {
  if (this.isModified('name') || this.isNew) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    this.slug = slug;
  }
  next();
});

// ====================== STATIC METHODS ======================

// Create a single category
categorySchema.statics.createOne = async function (data) {
  // Check if category with same name already exists
  const existingCategory = await this.findOne({ name: data.name.trim() });
  if (existingCategory) {
    throw new Error('Category name already exists');
  }

  const category = new this(data);
  return await category.save();
};

// Get all categories
categorySchema.statics.getAll = async function () {
  return await this.find({}).sort({ name: 1 }).lean();
};

// Find category by ID
categorySchema.statics.getById = async function (id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid category ID');
  }

  const category = await this.findById(id);
  if (!category) {
    throw new Error('Category not found');
  }

  return category;
};

// Find category by slug
categorySchema.statics.getBySlug = async function (slug) {
  if (!slug || !slug.trim()) {
    throw new Error('Slug is required');
  }

  const category = await this.findOne({ slug: slug.trim() });
  if (!category) {
    throw new Error('Category not found');
  }

  return category;
};

// Update category by ID
categorySchema.statics.updateById = async function (id, updateData) {
  const category = await this.getById(id);

  // Check name uniqueness if name is being updated
  if (updateData.name && updateData.name.trim() !== category.name) {
    const existing = await this.findOne({
      name: updateData.name.trim(),
      _id: { $ne: id },
    });

    if (existing) {
      throw new Error('Category name already exists');
    }
  }

  Object.assign(category, updateData);
  return await category.save();
};

// Delete category by ID
categorySchema.statics.deleteById = async function (id) {
  const category = await this.getById(id);

  // Check if category has products
  const hasProducts = await category.hasProducts();
  if (hasProducts) {
    const productCount = await category.getProductCount();
    throw new Error(`Cannot delete category with ${productCount} products`);
  }

  // Use normal mongoose delete
  await this.findByIdAndDelete(id);
  return { deleted: true, categoryId: id };
};

// ====================== INSTANCE METHODS ======================

// Get product count for this category
categorySchema.methods.getProductCount = async function () {
  const Product = mongoose.model('Product');
  return await Product.countDocuments({
    category: this._id,
    isDeleted: false,
  });
};

// Check if category has products
categorySchema.methods.hasProducts = async function () {
  const count = await this.getProductCount();
  return count > 0;
};

// Get products with pagination
categorySchema.methods.getProductsWithPagination = async function (
  options = {}
) {
  const { page = 1, limit = 10 } = options;
  const Product = mongoose.model('Product');

  const skip = (page - 1) * limit;

  const [products, totalProducts] = await Promise.all([
    Product.find({
      category: this._id,
      isDeleted: false,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('vendor', 'name')
      .lean(),
    Product.countDocuments({
      category: this._id,
      isDeleted: false,
    }),
  ]);

  return {
    products,
    productCount: totalProducts,
    pagination: {
      page,
      limit,
      total: totalProducts,
      pages: Math.ceil(totalProducts / limit),
    },
  };
};

// Get formatted category data
categorySchema.methods.toJSON = function () {
  const category = this.toObject();
  return {
    _id: category._id,
    name: category.name,
    slug: category.slug,
    image: category.image || '/default-images/category-placeholder.jpg',
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};

module.exports = mongoose.model('Category', categorySchema);
