const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const { resSuccessObject } = require('../utils/responseObject');

//Products
class ProductsController {
  //Create new product(Admin only)
  static async createProduct(req, res) {
    if (req.body.categoryId) {
      req.body.category = new mongoose.Types.ObjectId(req.body.categoryId);
    }

    // Set vendor to the authenticated user
    req.body.vendor = req.user._id;

    // Create the product
    const product = await Product.create({ ...req.body });

    // Populate the created product with related data
    const populated = await Product.findById(product._id)
      .populate('category', 'name slug image')
      .populate('vendor', 'name email')
      .select('-categoryId');

    res.json(
      resSuccessObject({
        message: 'Product created successfully',
        results: populated,
      })
    );
  }

  //Get all products
  static async getAllProducts(req, res) {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      category,
      minPrice,
      maxPrice,
      search,
      isActive,
    } = req.query;

    // Check for invalid page or limit values
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ message: 'Invalid page or limit values.' });
    }

    const filter = { isDeleted: false };

    // Apply isActive filter
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (category) {
      // Apply category filter
      const cat = await Category.findOne({ slug: category }).select('_id');
      if (cat) {
        filter.category = cat._id;
      } else {
        // No matching category — return empty result
        return res.json({ message: 'No matching category' });
      }
    }

    // Apply price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Apply text search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Product.countDocuments(filter);

    // Execute the main query with pagination and population
    const products = await Product.find(filter)
      .select('-categoryId')
      .sort(sort)
      .paginate({
        page: parseInt(page),
        limit: parseInt(limit),
      })
      .populate('category', 'name slug image')
      .populate('vendor', 'name email')
      .lean();

    return res.json({
      success: true,
      count: products.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      },
      products: products,
    });
  }

  //Get a single product
  static async getProductById(req, res) {
    const { id } = res.params;

    if (!mongoose.Types.ObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID format',
      });
    }

    const product = await Product.findOne({ _id: id, isDeleted: false })
      .populate('category', 'name')
      .populate('vendor', 'name email')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    return res.json({
      success: true,
      result: product,
    });
  }

  static async getProductsByCategory(req, res) {
    const { categoryId } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      minPrice,
      maxPrice,
      search,
      isActive = true,
    } = req.query;

    // Build filter
    const filter = {
      isDeleted: false,
      isActive: isActive === 'true',
    };

    // Handle category filter
    if (mongoose.Types.ObjectId.isValid(categoryId)) {
      filter.category = categoryId;
    } else {
      filter.categoryId = categoryId;
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    let query = Product.find(filter);

    // Text search
    if (search) {
      query = query.or([
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]);
    }

    // Get total count
    const total = await Product.countDocuments(
      search
        ? {
            ...filter,
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
            ],
          }
        : filter
    );

    // Execute query
    const products = await query
      .paginate({ page: parseInt(page), limit: parseInt(limit) })
      .sort(sort)
      .populate('category', 'name')
      .populate('vendor', 'name email')
      .lean();

    return res.json({
      success: true,
      count: products.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1,
      },
      results: products,
    });
  }

  //Update product(Admin only)
  static async updateProduct(req, res) {
    const productId = req.params.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID format',
      });
    }
    const product = await Product.findOneAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('categories', 'name');

    if (!product || product.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found or deleted' });
    }

    return res.json(
      resSuccessObject({
        results: product,
      })
    );
  }

  //Delete product(Admin only)
  static async deleteProduct(req, res) {
    const productId = req.params.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID format',
      });
    }

    const product = await Product.findByIdAndUpdate(
      productId,
      { isDeleted: true, isActive: false },
      { new: true }
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: 'Product not found' });
    }
    return res
      .status(200)
      .json({ success: true, message: 'Product soft-deleted successfully' });
  }
}

module.exports = ProductsController;
