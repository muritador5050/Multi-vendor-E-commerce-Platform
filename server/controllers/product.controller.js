const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Category = require('../models/category.model');

class ProductsController {
  static async createProduct(req, res) {
    const { body, user } = req;
    const productsData = Array.isArray(body) ? body : [body];

    const categoryIds = productsData
      .map((p) => p.categoryId)
      .filter(Boolean)
      .map((id) => new mongoose.Types.ObjectId(id));

    if (categoryIds.length > 0) {
      const existingCategories = await Category.find({
        _id: { $in: categoryIds },
      });
      if (existingCategories.length !== categoryIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more categories do not exist',
        });
      }
    }

    const processedProducts = productsData.map((productData) => {
      const processed = { ...productData };

      if (processed.categoryId) {
        processed.category = new mongoose.Types.ObjectId(processed.categoryId);
        delete processed.categoryId;
      }

      processed.vendor = user.id;
      return processed;
    });

    const createdProducts = await Product.create(processedProducts);
    const productsArray = Array.isArray(createdProducts)
      ? createdProducts
      : [createdProducts];

    const populatedProducts = await Product.find({
      _id: { $in: productsArray.map((p) => p._id) },
    })
      .populate('category', 'name slug image')
      .populate('vendor', 'name email');

    return res.status(201).json({
      success: true,
      message: `${populatedProducts.length} product(s) created successfully`,
      data: populatedProducts,
      count: populatedProducts.length,
    });
  }

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
      vendor,
      material,
      size,
      color,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

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
        return res.status(200).json({
          success: true,
          message: 'Products retrieved successfully',
          data: {
            products: [],
            pagination: {
              total: 0,
              page: pageNum,
              pages: 0,
              hasNext: false,
              hasPrev: pageNum > 1,
              limit: limitNum,
            },
          },
        });
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

    const knownAttributes = ['material', 'size', 'color'];
    knownAttributes.forEach((attr) => {
      if (req.query[attr]) {
        filter[`attributes.${attr}`] = {
          $regex: req.query[attr],
          $options: 'i',
        };
      }
    });

    const total = await Product.countDocuments(filter);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('category', 'name slug image')
      .populate('vendor', 'name email')
      .lean();

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          total,
          page: pageNum,
          pages: totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
          limit: limitNum,
        },
      },
    });
  }

  static async getProductsByCategorySlug(req, res) {
    const { slug } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      minPrice,
      maxPrice,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    let selectedCategory;

    if (mongoose.Types.ObjectId.isValid(slug)) {
      selectedCategory = await Category.findById(slug);
    } else {
      selectedCategory = await Category.findOne({ slug: slug });
    }
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const filter = {
      category: selectedCategory._id,
      isDeleted: false,
    };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const total = await Product.countDocuments(filter);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('category', 'name slug image')
      .populate('vendor', 'name email')
      .lean();

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      message: `Products for category '${selectedCategory.name}' retrieved successfully`,
      data: {
        products,
        pagination: {
          total,
          page: pageNum,
          pages: totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
          limit: limitNum,
        },
      },
    });
  }

  static async getProductById(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findOne({
      _id: id,
      isDeleted: false,
    })
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

  static async updateProduct(req, res) {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    if (updateData.categoryId) {
      const category = await Category.findById(updateData.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category does not exist',
        });
      }
      updateData.category = updateData.categoryId;
      delete updateData.categoryId;
    }

    const filter = { _id: id, isDeleted: false };

    if (req.user.role !== 'admin') {
      filter.vendor = req.user.id;
    }

    const product = await Product.findOneAndUpdate(
      filter,
      { $set: updateData },
      { new: true, runValidators: true }
    )
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

  static async deleteProduct(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const filter = { _id: id, isDeleted: false };

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
          ? 'Product not found or already deleted'
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

  static async getVendorProducts(req, res) {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      isActive,
      category,
      search,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const filter = {
      vendor: req.user.id,
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

    const total = await Product.countDocuments(filter);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('category', 'name slug image')
      .lean();

    const totalPages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      message: 'Vendor products retrieved successfully',
      data: {
        products,
        pagination: {
          total,
          page: pageNum,
          pages: totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
          limit: limitNum,
        },
      },
    });
  }
}

module.exports = ProductsController;
