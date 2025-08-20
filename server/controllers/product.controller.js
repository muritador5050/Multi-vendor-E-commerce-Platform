const Product = require('../models/product.model');
const { BACKEND_URL } = require('../configs/index');

class ProductsController {
  static processImages(files) {
    return (
      files?.map(
        (file) => `${BACKEND_URL}/uploads/products/${file.filename}`
      ) || []
    );
  }

  // Helper method to parse attributes
  static parseAttributes(attributes) {
    if (attributes && typeof attributes === 'string') {
      try {
        return JSON.parse(attributes);
      } catch (error) {
        console.error('Failed to parse attributes:', error);
        return {};
      }
    }
    return attributes || {};
  }

  static async createProduct(req, res) {
    const { files, body, user } = req;
    const images = ProductsController.processImages(files);

    const productData = {
      ...body,
      images,
      attributes: ProductsController.parseAttributes(body.attributes),
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
    const newImages = ProductsController.processImages(req.files);

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
    const result = await Product.getPaginated(req.query);

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result,
    });
  }

  static async getProductsByCategorySlug(req, res) {
    const { slug } = req.params;
    const result = await Product.getPaginated({ category: slug }, req.query);

    return res.status(200).json({
      success: true,
      message: 'Products for category retrieved successfully',
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
    const result = await Product.toggleStatus(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: `Product ${result.isActive ? 'activated' : 'deactivated'}`,
      data: result,
    });
  }

  static async deleteProduct(req, res) {
    const result = await Product.softDelete(req.params.id, req.user);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: result,
    });
  }

  static async getVendorProducts(req, res) {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only vendors can access their products',
      });
    }

    const result = await Product.getPaginated(
      { vendor: req.user.id },
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
