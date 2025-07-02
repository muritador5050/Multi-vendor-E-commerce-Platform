const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Category = require('../models/category.model');

//Products
class ProductsController {
  //Create new product(Vendor only)
  static async createProduct(req, res) {
    if (req.body.categoryId) {
      req.body.category = new mongoose.Types.ObjectId(req.body.categoryId);
    }

    // Set vendor to the authenticated user
    req.body.vendor = req.user.id;

    // Create the product
    const product = await Product.create({ ...req.body });

    // Populate the created product with related data
    const populated = await Product.findById(product._id)
      .populate('category', 'name slug image')
      .populate('vendor', 'name email')
      .select('-categoryId');

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: populated,
    });
  }

  //Get all products (Public access)
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
      return res.status(400).json({
        success: false,
        message: 'Invalid page or limit values.',
      });
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
        return res.status(404).json({
          success: false,
          message: 'No matching category found',
          data: {
            products: [],
            pagination: {
              total: 0,
              page: parseInt(page),
              pages: 0,
              hasNext: false,
              hasPrev: parseInt(page) > 1,
            },
          },
        });
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

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products: products,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  }

  //Get a single product (Public access)
  static async getProductById(req, res) {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .select('-categoryId')
      .populate('category', 'name slug image')
      .populate('vendor', 'name email')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product,
    });
  }

  //Update product (Vendor can update own products, Admin can update any)
  static async updateProduct(req, res) {
    //Build the filter
    const filter = { _id: req.params.id, isDeleted: false };

    // If user is not admin, they can only update their own products
    if (req.user.role !== 'admin') {
      filter.vendor = req.user.id;
    }

    const product = await Product.findOneAndUpdate(
      filter,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .select('-categoryId')
      .populate('category', 'name slug image')
      .populate('vendor', 'name email');

    if (!product) {
      const message =
        req.user.role === 'admin'
          ? 'Product not found or deleted'
          : 'Product not found, deleted, or you do not have permission to update this product';

      return res.status(404).json({
        success: false,
        message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  }

  //Delete product (Admin can delete any, Vendor can delete own)
  static async deleteProduct(req, res) {
    const filter = { _id: req.params.id };

    // If user is not admin, they can only delete their own products
    if (req.user.role !== 'admin') {
      filter.vendor = req.user.id;
    }

    const product = await Product.findOneAndUpdate(
      filter,
      { isDeleted: true, isActive: false },
      { new: true }
    );

    if (!product) {
      const message =
        req.user.role === 'admin'
          ? 'Product not found'
          : 'Product not found or you do not have permission to delete this product';

      return res.status(404).json({
        success: false,
        message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  }

  // Get vendor's own products (Vendor only)
  static async getVendorProducts(req, res) {
    const { page = 1, limit = 10, sort = '-createdAt', isActive } = req.query;

    // Check for invalid page or limit values
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page or limit values.',
      });
    }

    const filter = {
      vendor: req.user.id,
      isDeleted: false,
    };

    // Apply isActive filter
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .select('-categoryId')
      .sort(sort)
      .paginate({
        page: parseInt(page),
        limit: parseInt(limit),
      })
      .populate('category', 'name slug image')
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Vendor products retrieved successfully',
      data: {
        products: products,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  }
}

module.exports = ProductsController;
