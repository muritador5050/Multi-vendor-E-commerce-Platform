const mongoose = require('mongoose');
const slugify = require('slugify');
const Category = require('./category.model');
const fs = require('fs');

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - categoryId
 *       properties:
 *         name:
 *           type: string
 *           example: "Sample Product"
 *         description:
 *           type: string
 *           example: "This is a sample product description."
 *         slug:
 *           type: string
 *           example: "sample-product"
 *         price:
 *           type: number
 *           format: float
 *           example: 19.99
 *         discount:
 *           type: number
 *           format: float
 *           example: 10
 *         quantityInStock:
 *           type: number
 *           example: 100
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             example: "https://example.com/image.jpg"
 *         categoryId:
 *           type: string
 *           example: "60d5f484f1b2c8b8f8e4c8b8"
 *         attributes:
 *           type: object
 *           additionalProperties:
 *             type: string
 *         averageRating:
 *           type: number
 *           format: float
 *           example: 4.5
 *         totalReviews:
 *           type: number
 *           example: 25
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    slug: { type: String, unique: true, trim: true, lowercase: true },
    price: {
      type: Number,
      required: true,
      min: 0.01,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    quantityInStock: {
      type: Number,
      default: 5,
      min: 1,
    },
    images: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    attributes: {
      type: mongoose.Schema.Types.Mixed, 
      default: {},
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Indexes for better performance
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1, isDeleted: 1 });

// ============ MIDDLEWARE ============

// Pre-save middleware for slug generation
productSchema.pre('save', async function (next) {
  if (!this.isModified('name') && this.slug) {
    return next();
  }

  if (!this.name || typeof this.name !== 'string') {
    return next(new Error('Product name is required and must be a string'));
  }

  try {
    const baseSlug = slugify(this.name.trim(), { lower: true, strict: true });
    let uniqueSlug = baseSlug;
    let counter = 1;

    // Check for existing slug and make it unique
    while (
      await this.constructor.findOne({
        slug: uniqueSlug,
        _id: { $ne: this._id }, // Exclude current document for updates
      })
    ) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = uniqueSlug;
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware for category validation
productSchema.pre('save', async function (next) {
  if (this.category && this.isModified('category')) {
    const categoryExists = await Category.findById(this.category);
    if (!categoryExists) {
      return next(new Error(`Category with ID ${this.category} not found`));
    }
  }
  next();
});

// Pre-save middleware to normalize images array
productSchema.pre('save', function (next) {
  if (this.images && !Array.isArray(this.images)) {
    this.images = this.images ? [this.images] : [];
  }
  next();
});

// ============ QUERY HELPERS ============

productSchema.query.paginate = function ({ page = 1, limit = 10 }) {
  const skip = limit * (page - 1);
  return this.skip(skip).limit(limit);
};

productSchema.query.active = function () {
  return this.where({ isDeleted: false, isActive: true });
};

productSchema.query.byVendor = function (vendorId) {
  return this.where({ vendor: vendorId });
};

// ============ STATIC METHODS ============

productSchema.statics.createProducts = async function (productsData, vendorId) {
  const productsArray = Array.isArray(productsData)
    ? productsData
    : [productsData];

  if (productsArray.length === 0) {
    throw new Error('No products provided');
  }

  const productsToCreate = productsArray.map((product) => ({
    ...product,
    vendor: vendorId,
  }));

  const createdProducts = await this.create(productsToCreate);

  const populatedProducts = await this.find({
    _id: { $in: createdProducts.map((p) => p._id) },
  })
    .populate('category', 'name slug image')
    .populate('vendor', 'name email')
    .lean();

  return Array.isArray(productsData) ? populatedProducts : populatedProducts[0];
};

productSchema.statics.updateById = async function (id, updateData, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid product ID format');
  }

  const product = await this.findOne({ _id: id, isDeleted: false });
  if (!product) {
    throw new Error('Product not found or deleted');
  }

  // Check permissions
  if (user.role !== 'admin' && product.vendor.toString() !== user.id) {
    throw new Error('You do not have permission to update this product');
  }

  // Merge new images with existing ones
  if (updateData.images?.length) {
    updateData.images = [...updateData.images, ...(product.images || [])];
  }

  // Update and return populated document
  return this.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
    populate: [
      { path: 'category', select: 'name slug image' },
      { path: 'vendor', select: 'name email' },
    ],
  });
};

// Build advanced filter
productSchema.statics.buildFilter = function (queryParams) {
  const {
    category,
    minPrice,
    maxPrice,
    search,
    isActive,
    vendor,
    material,
    size,
    color,
  } = queryParams;

  const filter = { isDeleted: false };

  // Basic filters
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (vendor) filter.vendor = vendor;

  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Search filter
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }

  // Attribute filters
  [
    { key: 'material', value: material },
    { key: 'size', value: size },
    { key: 'color', value: color },
  ]
    .filter((attr) => attr.value)
    .forEach((attr) => {
      filter[`attributes.${attr.key}`] = { $regex: attr.value, $options: 'i' };
    });

  return {
    filter,
    categoryPromise: category ? this.resolveCategoryFilter(category) : null,
  };
};

// Helper to resolve category filter
productSchema.statics.resolveCategoryFilter = async function (category) {
  const categoryDoc = mongoose.Types.ObjectId.isValid(category)
    ? await Category.findById(category)
    : await Category.findOne({ slug: category });

  return categoryDoc?._id;
};

// Get paginated products with advanced filtering
productSchema.statics.getPaginated = async function (
  queryParams = {},
  options = {}
) {
  const { page = 1, limit = 10, sort = '-createdAt' } = options;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const { filter, categoryPromise } = this.buildFilter(queryParams);

  // Resolve category filter if needed
  if (categoryPromise) {
    const categoryId = await categoryPromise;
    if (categoryId) {
      filter.category = categoryId;
    } else {
      return {
        products: [],
        pagination: { total: 0, page: pageNum, pages: 0 },
      };
    }
  }

  const total = await this.countDocuments(filter);
  const skip = (pageNum - 1) * limitNum;

  const products = await this.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .populate('category', 'name slug image')
    .populate('vendor', 'name email')
    .lean();

  return {
    products,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
      limit: limitNum,
    },
  };
};

// Get single product by ID
productSchema.statics.findActiveById = async function (id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid product ID format');
  }

  return this.findOne({ _id: id, isDeleted: false })
    .populate('category', 'name slug image')
    .populate('vendor', 'name email')
    .lean();
};

// Soft delete product
productSchema.statics.softDelete = async function (id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid product ID format');
  }

  const filter = { _id: id, isDeleted: false };
  if (user.role !== 'admin') filter.vendor = user.id;

  const product = await this.findOneAndUpdate(
    filter,
    { isDeleted: true, isActive: false },
    { new: true }
  );

  if (!product) {
    throw new Error(
      user.role === 'admin'
        ? 'Product not found or already deleted'
        : 'Product not found or you do not have permission to delete this product'
    );
  }

  return product;
};

// Get vendor products
productSchema.statics.getByVendor = function (
  vendorId,
  queryParams = {},
  options = {}
) {
  return this.getPaginated({ ...queryParams, vendor: vendorId }, options);
};

// Get products by category
productSchema.statics.getByCategory = function (categoryId, options = {}) {
  return this.getPaginated({ category: categoryId }, options);
};

// ============ INSTANCE METHODS ============

// Toggle active status
productSchema.methods.toggleStatus = function () {
  this.isActive = !this.isActive;
  return this.save();
};

// Calculate discounted price
productSchema.methods.getDiscountedPrice = function () {
  return this.discount > 0
    ? this.price * (1 - this.discount / 100)
    : this.price;
};

// Check if product is in stock
productSchema.methods.isInStock = function () {
  return this.quantityInStock > 0;
};

// Get formatted product data
productSchema.methods.getFormattedData = function () {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    slug: this.slug,
    originalPrice: this.price,
    discountedPrice: this.getDiscountedPrice(),
    discount: this.discount,
    inStock: this.isInStock(),
    quantityInStock: this.quantityInStock,
    images: this.images,
    attributes: this.attributes,
    rating: {
      average: this.averageRating,
      total: this.totalReviews,
    },
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('Product', productSchema);
