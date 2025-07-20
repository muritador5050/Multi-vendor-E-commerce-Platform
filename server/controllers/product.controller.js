const Product = require('../models/product.model');

class ProductsController {
  static async createProduct(req, res) {
    try {
      const products = await Product.createProducts(req.body, req.user.id);

      return res.status(201).json({
        success: true,
        message: `${products.length} product(s) created successfully`,
        data: products,
        count: products.length,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getAllProducts(req, res) {
    const { filter, categoryNotFound } = await Product.buildFilter(req.query);

    if (categoryNotFound) {
      return res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        data: {
          products: [],
          pagination: {
            total: 0,
            page: Math.max(1, parseInt(req.query.page || 1)),
            pages: 0,
            hasNext: false,
            hasPrev: Math.max(1, parseInt(req.query.page || 1)) > 1,
            limit: Math.min(100, Math.max(1, parseInt(req.query.limit || 10))),
          },
        },
      });
    }

    const result = await Product.getPaginatedProducts(filter, req.query);

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result,
    });
  }

  static async getProductsByCategorySlug(req, res) {
    const { slug } = req.params;

    const selectedCategory = await Product.findCategoryBySlugOrId(slug);
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const result = await Product.getProductsByCategory(
      selectedCategory._id,
      req.query
    );

    return res.status(200).json({
      success: true,
      message: `Products for category '${selectedCategory.name}' retrieved successfully`,
      data: result,
    });
  }

  static async getProductById(req, res) {
    const product = await Product.findActiveById(req.params.id);

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

  static async toggleProductActive(req, res) {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const updatedProduct = await product.toggleActive();

    return res.status(200).json({
      success: true,
      message: `Product ${
        updatedProduct.isActive ? 'activated' : 'deactivated'
      }`,
      data: updatedProduct,
    });
  }

  static async updateProduct(req, res) {
    const product = await Product.updateProductById(
      req.params.id,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  }

  static async deleteProduct(req, res) {
    await Product.softDeleteById(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  }

  static async getVendorProducts(req, res) {
    const result = await Product.getProductsByVendor(
      req.user.id,
      req.query,
      req.query
    );

    return res.status(200).json({
      success: true,
      message: 'Vendor products retrieved successfully',
      data: result,
    });
  }
}

module.exports = ProductsController;
