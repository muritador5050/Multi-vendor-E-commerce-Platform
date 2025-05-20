const mongoose = require('mongoose');
const Product_model = require('../models/product.model');
const { resSuccessObject } = require('../utils/responseObject');

//Products
class Products {
  //Create new product(Admin only)
  static async createProduct(req, res) {
    const product = new Product_model({
      ...req.body,
      vendor: req.role.vendor || req.user._id,
    });
    // Save to database
    const saveProduct = await product.save();

    res.json(
      resSuccessObject({
        message: 'Done',
        results: saveProduct,
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

    // Always filter deleted products
    let productQuery = await Product_model.find({
      isDeleted: false,
    })
      .activeFilter(isActive)
      .filterByCategory(category)
      .paginate({ page: parseInt(page), limit: parseInt(limit) })
      .priceRangeFilter(minPrice, maxPrice)
      .searchByText(search)
      .sort(sort)
      .populate('categories', 'name')
      .populate('vendor', 'name email');

    const [products, total] = await Promise.all([
      productQuery,
      Product_model.countDocuments({
        isDeleted: false,
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(category && { categories: category }),
        ...(minPrice || maxPrice
          ? {
              price: {
                ...(minPrice && { $gte: parseFloat(minPrice) }),
                ...(maxPrice && { $lte: parseFloat(maxPrice) }),
              },
            }
          : {}),
        ...(search && {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        }),
      }),
    ]);

    return res.json(
      {
        count: products.length,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
      resSuccessObject({
        results: products,
      })
    );
  }

  //Get a single product
  static async getProductById(req, res) {
    const productId = res.params.id;

    if (!mongoose.Types.ObjectId(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID format',
      });
    }

    const product = await Product_model.findById(productId)
      .populate('categories', 'name')
      .populate('vendor', 'name email');

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    return res.json(
      resSuccessObject({
        results: product,
      })
    );
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
    const product = await Product_model.findOneAndUpdate(
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

    const product = await Product_model.findByIdAndUpdate(
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

module.exports = Products;
