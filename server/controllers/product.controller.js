const Product = require('../models/product.model');
const path = require('path');
const fs = require('fs');
const { BACKEND_URL } = require('../configs/index');

class ProductsController {
  // static async createProduct(req, res) {
  //   try {
  //     const images =
  //       req.files?.map(
  //         (file) => `${BACKEND_URL}/uploads/products/${file.filename}`
  //       ) || [];

  //     const isBulk = Array.isArray(req.body.products);
  //     let productData;

  //     if (isBulk) {
  //       productData = req.body.products.map((product, index) => ({
  //         ...product,
  //         images: index === 0 ? images : product.images || [],
  //       }));
  //     } else {
  //       productData = {
  //         ...req.body,
  //         images,
  //       };
  //     }

  //     const result = await Product.createProducts(productData, req.user.id);

  //     return res.status(201).json({
  //       success: true,
  //       message: `Product${isBulk ? 's' : ''} created successfully`,
  //       data: result,
  //       count: Array.isArray(result) ? result.length : 1,
  //     });
  //   } catch (error) {
  //     if (req.files?.length > 0) {
  //       req.files.forEach((file) => {
  //         fs.unlink(file.path, () => {});
  //       });
  //     }

  //     return res.status(400).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

  static async createProduct(req, res) {
    try {
      const images =
        req.files?.map(
          (file) => `${BACKEND_URL}/uploads/products/${file.filename}`
        ) || [];

      // Parse attributes if it's a string
      let parsedBody = { ...req.body };
      if (typeof parsedBody.attributes === 'string') {
        try {
          parsedBody.attributes = JSON.parse(parsedBody.attributes);
        } catch (e) {
          parsedBody.attributes = {};
        }
      }

      const isBulk = Array.isArray(parsedBody.products);
      let productData;

      if (isBulk) {
        productData = parsedBody.products.map((product, index) => {
          // Parse attributes for each product in bulk
          if (typeof product.attributes === 'string') {
            try {
              product.attributes = JSON.parse(product.attributes);
            } catch (e) {
              product.attributes = {};
            }
          }
          return {
            ...product,
            images: index === 0 ? images : product.images || [],
          };
        });
      } else {
        productData = {
          ...parsedBody,
          images,
        };
      }

      const result = await Product.createProducts(productData, req.user.id);

      return res.status(201).json({
        success: true,
        message: `Product${isBulk ? 's' : ''} created successfully`,
        data: result,
        count: Array.isArray(result) ? result.length : 1,
      });
    } catch (error) {
      if (req.files?.length > 0) {
        req.files.forEach((file) => {
          fs.unlink(file.path, () => {});
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
  static async updateProduct(req, res) {
    const { id } = req.params;

    const currentProduct = await Product.findById(id);
    if (!currentProduct) {
      throw new Error('Product not found');
    }

    const newImages =
      req.files?.map(
        (file) => `${BACKEND_URL}/uploads/products/${file.filename}`
      ) || [];
    if (newImages.length > 0) {
      req.body.images = [...newImages, ...(currentProduct.images || [])];
    }

    const updatedProduct = await Product.updateProductById(
      id,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct,
    });
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

  static async toggleProductStatus(req, res) {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
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
