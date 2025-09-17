const mongoose = require('mongoose');
const slugify = require('slugify');
const Category = require('./category.model');

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

    while (
      await this.constructor.findOne({
        slug: uniqueSlug,
        _id: { $ne: this._id },
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

productSchema.statics.validateObjectId = function (id, fieldName = 'ID') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
};

// Helper method to check permissions
productSchema.statics.checkPermissions = function (
  product,
  user,
  action = 'modify'
) {
  if (user.role !== 'admin' && product.vendor.toString() !== user.id) {
    throw new Error(`You do not have permission to ${action} this product`);
  }
};

// Create products (single or multiple)
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
  this.validateObjectId(id, 'product ID');

  const product = await this.findOne({ _id: id, isDeleted: false });
  if (!product) {
    throw new Error('Product not found or deleted');
  }

  this.checkPermissions(product, user, 'update');

  if (updateData.images?.length) {
    product.images = [...updateData.images, ...(product.images || [])];
  }

  if (updateData.attributes) {
    product.attributes = {
      ...product.attributes,
      ...updateData.attributes,
    };
  }

  Object.keys(updateData).forEach((key) => {
    if (key !== 'images' && key !== 'attributes') {
      product[key] = updateData[key];
    }
  });

  await product.save();

  return await this.findById(product._id)
    .populate('category', 'name slug image')
    .populate('vendor', 'name email')
    .lean();
};

productSchema.statics.resolveCategoryFilter = async function (category) {
  const categoryDoc = mongoose.Types.ObjectId.isValid(category)
    ? await Category.findById(category)
    : await Category.findOne({ slug: category });

  return categoryDoc?._id;
};

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

productSchema.statics.getPaginated = async function (
  queryParams = {},
  options = {}
) {
  const { page = 1, limit = 10, sort = '-createdAt' } = options;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const { filter, categoryPromise } = this.buildFilter(queryParams);

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

// Find active product by ID
productSchema.statics.findActiveById = async function (id) {
  this.validateObjectId(id, 'product ID');

  return this.findOne({ _id: id, isDeleted: false })
    .populate('category', 'name slug image')
    .populate('vendor', 'name email')
    .lean();
};

// Find product by ID (for internal operations)
productSchema.statics.findByIdInternal = async function (id) {
  this.validateObjectId(id, 'product ID');

  const product = await this.findOne({ _id: id, isDeleted: false });
  if (!product) {
    throw new Error('Product not found');
  }

  return product;
};

// Toggle product status
productSchema.statics.toggleStatus = async function (id, user) {
  const product = await this.findByIdInternal(id);
  this.checkPermissions(product, user, 'modify');

  product.isActive = !product.isActive;
  await product.save();

  return {
    id: product._id,
    isActive: product.isActive,
    name: product.name,
  };
};

// Soft delete product
productSchema.statics.softDelete = async function (id, user) {
  const product = await this.findByIdInternal(id);
  this.checkPermissions(product, user, 'delete');

  await this.findByIdAndUpdate(
    id,
    { isDeleted: true, isActive: false },
    { new: true }
  );

  return {
    id: product._id,
    name: product.name,
  };
};

productSchema.statics.softDeleteByUser = async function (userId, adminUser) {
  if (adminUser.role !== 'admin') {
    throw new Error('You do not have permission to delete these products');
  }
  const result = await this.updateMany(
    { vendor: userId, isDeleted: false },
    { isDeleted: true, isActive: false }
  );
  return result.modifiedCount;
};

// ============ INSTANCE METHODS ============

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
