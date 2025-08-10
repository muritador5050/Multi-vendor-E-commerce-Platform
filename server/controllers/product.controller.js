const Product = require('../models/product.model');
const path = require('path');
const fs = require('fs');
const { BACKEND_URL } = require('../configs/index');

class ProductsController {
  static async createProduct(req, res) {
    const { files, body, user } = req;
    const images =
      files?.map(
        (file) => `${BACKEND_URL}/uploads/products/${file.filename}`
      ) || [];

    if (body.attributes && typeof body.attributes === 'string') {
      try {
        body.attributes = JSON.parse(body.attributes);
      } catch (error) {
        console.error('Failed to parse attributes:', error);
        body.attributes = {};
      }
    }

    const productData = {
      ...body,
      images,
    };
    const createdProduct = await Product.createProducts(productData, user.id);
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: createdProduct,
    });
  }

  static async updateProduct(req, res) {
    const { id } = req.params;

    const newImages =
      req.files?.map(
        (file) => `${BACKEND_URL}/uploads/products/${file.filename}`
      ) || [];

    if (newImages.length > 0) {
      req.body.images = newImages;
    }

    const updatedProduct = await Product.updateById(id, req.body, req.user);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  }

  static async getAllProducts(req, res) {
    const result = await Product.getPaginated(req.query, req.query);

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result,
    });
  }

  static async getProductsByCategorySlug(req, res) {
    const { slug } = req.params;

    const result = await Product.getByCategory({ category: slug }, req.query);

    return res.status(200).json({
      success: true,
      message: `Products for category retrieved successfully`,
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

  static async toggleProductStatus(req, res) {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (
      req.user.role !== 'admin' &&
      product.vendor.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this product',
      });
    }

    const updatedProduct = await product.toggleStatus();

    return res.status(200).json({
      success: true,
      message: `Product ${
        updatedProduct.isActive ? 'activated' : 'deactivated'
      }`,
      data: {
        id: updatedProduct._id,
        isActive: updatedProduct.isActive,
      },
    });
  }

  static async deleteProduct(req, res) {
    const deletedProduct = await Product.softDelete(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        id: deletedProduct._id,
        name: deletedProduct.name,
      },
    });
  }

  static async getVendorProducts(req, res) {
    const result = await Product.getByVendor(req.user.id, req.query, req.query);

    return res.status(200).json({
      success: true,
      message: 'Vendor products retrieved successfully',
      data: result,
    });
  }
}

module.exports = ProductsController;
