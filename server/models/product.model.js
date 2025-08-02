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
 *         - category
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
 *         category:
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
      default: 1,
      min: 1,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    attributes: {
      type: Map,
      of: String,
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

// Query helper
productSchema.query.paginate = function ({ page, limit }) {
  const skip = limit * (page - 1);
  return this.skip(skip).limit(limit);
};

// Auto-generate slug
// productSchema.pre('save', async function (next) {
//   if (this.isModified('name') || this.isNew) {
//     this.slug = slugify(this.name, { lower: true, strict: true });
//   }
//   next();
// });

// ============ STATIC METHODS ============

// Updated createProducts static method
productSchema.statics.createProducts = async function (productsData, vendorId) {
  const productsArray = Array.isArray(productsData)
    ? productsData
    : [productsData];

  const isSingle = !Array.isArray(productsData);

  const categoryIds = [
    ...new Set(productsArray.map((p) => p.category).filter(Boolean)),
  ];

  if (categoryIds.length > 0) {
    const existingCategories = await Category.find({
      _id: { $in: categoryIds },
    }).select('_id');

    const existingIds = new Set(
      existingCategories.map((c) => c._id.toString())
    );
    const invalidCategories = categoryIds.filter((id) => !existingIds.has(id));

    if (invalidCategories.length > 0) {
      throw new Error(`Categories not found: ${invalidCategories.join(', ')}`);
    }
  }

  // Generate slugs for each product and ensure uniqueness
  const processedProducts = await Promise.all(
    productsArray.map(async (productData) => {
      const baseSlug = slugify(productData.name, { lower: true, strict: true });
      let uniqueSlug = baseSlug;
      let counter = 1;

      // Check if slug already exists and make it unique
      while (await this.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      return {
        ...productData,
        vendor: vendorId,
        slug: uniqueSlug, // Add the generated slug
        images: Array.isArray(productData.images)
          ? productData.images
          : productData.images
          ? [productData.images]
          : [],
      };
    })
  );

  const createdProducts = await this.insertMany(processedProducts);

  const populatedProducts = await this.find({
    _id: { $in: createdProducts.map((p) => p._id) },
  }).populate([
    { path: 'category', select: 'name slug image' },
    { path: 'vendor', select: 'name email' },
  ]);

  return isSingle ? populatedProducts[0] : populatedProducts;
};
productSchema.statics.updateProductById = async function (
  id,
  updateData,
  user
) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid product ID format');
  }

  const currentProduct = await this.findOne({ _id: id, isDeleted: false });
  if (!currentProduct) {
    throw new Error(
      user.role === 'admin'
        ? 'Product not found or deleted'
        : 'Product not found, deleted, or you do not have permission'
    );
  }

  // Verify ownership if not admin
  if (user.role !== 'admin' && currentProduct.vendor.toString() !== user.id) {
    throw new Error('You do not have permission to update this product');
  }

  // Handle category validation
  if (updateData.category) {
    const categoryExists = await Category.exists({ _id: updateData.category });
    if (!categoryExists) {
      throw new Error('Category does not exist');
    }
  }

  // Handle image deletions
  if (updateData.imagesToDelete && Array.isArray(updateData.imagesToDelete)) {
    // Verify the images to delete actually exist in current images
    const invalidDeletions = updateData.imagesToDelete.filter(
      (img) => !currentProduct.images.includes(img)
    );

    if (invalidDeletions.length > 0) {
      throw new Error(
        `Cannot delete non-existent images: ${invalidDeletions.join(', ')}`
      );
    }

    // Delete files from storage
    await Promise.all(
      updateData.imagesToDelete.map((imagePath) =>
        fs.promises.unlink(imagePath).catch(() => {})
      )
    );

    // Remove deleted images from current product images
    currentProduct.images = currentProduct.images.filter(
      (img) => !updateData.imagesToDelete.includes(img)
    );

    delete updateData.imagesToDelete;
  }

  if (updateData.images && Array.isArray(updateData.images)) {
    const existingImages = currentProduct.images || [];
    updateData.images = [...updateData.images, ...existingImages];
  }

  // Perform update
  const updatedProduct = await this.findByIdAndUpdate(
    id,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
      populate: [
        { path: 'category', select: 'name slug image' },
        { path: 'vendor', select: 'name email' },
      ],
    }
  );

  return updatedProduct;
};

// Build filter for product queries
productSchema.statics.buildFilter = async function (queryParams) {
  const { category, minPrice, maxPrice, search, isActive, vendor } =
    queryParams;

  const filter = { isDeleted: false };

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (category) {
    let categoryFilter;
    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryFilter = await Category.findById(category);
    } else {
      categoryFilter = await Category.findOne({ slug: category });
    }

    if (categoryFilter) {
      filter.category = categoryFilter._id;
    } else {
      return { filter, categoryNotFound: true };
    }
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  if (vendor) {
    filter.vendor = vendor;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }

  // Handle known attributes
  const knownAttributes = ['material', 'size', 'color'];
  knownAttributes.forEach((attr) => {
    if (queryParams[attr]) {
      filter[`attributes.${attr}`] = {
        $regex: queryParams[attr],
        $options: 'i',
      };
    }
  });

  return { filter, categoryNotFound: false };
};

// Get paginated products
productSchema.statics.getPaginatedProducts = async function (filter, options) {
  const { page = 1, limit = 10, sort = '-createdAt' } = options;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const total = await this.countDocuments(filter);
  const skip = (pageNum - 1) * limitNum;

  const products = await this.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNum)
    .populate('category', 'name slug image')
    .populate('vendor', 'name email')
    .lean();

  const totalPages = Math.ceil(total / limitNum);

  return {
    products,
    pagination: {
      total,
      page: pageNum,
      pages: totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
      limit: limitNum,
    },
  };
};

// Find category by slug or ID
productSchema.statics.findCategoryBySlugOrId = async function (identifier) {
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    return Category.findById(identifier);
  }
  return Category.findOne({ slug: identifier });
};

// Get products by category
productSchema.statics.getProductsByCategory = async function (
  categoryId,
  options
) {
  const { minPrice, maxPrice } = options;

  const filter = {
    category: categoryId,
    isDeleted: false,
  };

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  return this.getPaginatedProducts(filter, options);
};

// Find active product by ID
productSchema.statics.findActiveById = async function (id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid product ID format');
  }

  return this.findOne({
    _id: id,
    isDeleted: false,
  })
    .populate('category', 'name slug image')
    .populate('vendor', 'name email')
    .lean();
};

// Soft delete product
productSchema.statics.softDeleteById = async function (id, user) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid product ID format');
  }

  const filter = { _id: id, isDeleted: false };
  if (user.role !== 'admin') {
    filter.vendor = user.id;
  }

  const product = await this.findOneAndUpdate(
    filter,
    { isDeleted: true, isActive: false },
    { new: true }
  );

  if (!product) {
    const message =
      user.role === 'admin'
        ? 'Product not found or already deleted'
        : 'Product not found or you do not have permission to delete this product';
    throw new Error(message);
  }

  return product;
};

// Get vendor products
productSchema.statics.getProductsByVendor = async function (
  vendorId,
  queryParams,
  options
) {
  const { isActive, category, search } = queryParams;

  const filter = {
    vendor: vendorId,
    isDeleted: false,
  };

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (category) {
    const selectedCategory = await Category.findOne({
      $or: [{ slug: category }, { _id: category }],
    });
    if (selectedCategory) {
      filter.category = selectedCategory._id;
    }
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  return this.getPaginatedProducts(filter, options);
};

// ============ INSTANCE METHODS ============

// Toggle active status
productSchema.methods.toggleStatus = async function () {
  this.isActive = !this.isActive;
  return this.save();
};

// Calculate discounted price
productSchema.methods.getDiscountedPrice = function () {
  if (this.discount > 0) {
    return this.price * (1 - this.discount / 100);
  }
  return this.price;
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
