const Category = require('../models/category.model');
const path = require('path');
const { deleteFile } = require('../utils/FileUploads');

class CategoryController {
  static async createCategory(req, res) {
    const category = await Category.createWithValidation(req.body);

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  }

  static async createBulkCategories(req, res) {
    const createdCategories = await Category.createBulkWithValidation(req.body);

    return res.status(201).json({
      success: true,
      message: `${createdCategories.length} categories created successfully`,
      data: createdCategories,
    });
  }

  static async getAllCategories(req, res) {
    const categories = await Category.find({}).sort({ name: 1 });

    return res.json({
      success: true,
      message: `Found ${categories.length} categories`,
      data: categories,
    });
  }

  static async getCategoryBySlug(req, res) {
    const { slug } = req.params;
    const { includeProducts, page = 1, limit = 10 } = req.query;

    const responseData = await Category.findBySlugWithProducts(slug, {
      includeProducts: includeProducts === 'true',
      page,
      limit,
    });

    return res.json({
      success: true,
      message: 'Category found successfully.',
      data: responseData,
    });
  }

  static async getCategoryById(req, res) {
    const { id } = req.params;
    const category = await Category.findByIdWithValidation(id);

    return res.json({
      success: true,
      data: category,
    });
  }

  static async updateCategory(req, res) {
    const { id } = req.params;
    const updatedCategory = await Category.updateWithValidation(id, req.body);

    return res.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully',
    });
  }

  static async deleteCategory(req, res) {
    const { id } = req.params;
    const { force } = req.query;

    const category = await Category.findByIdWithValidation(id);
    const result = await category.deleteWithProducts(force === 'true');

    return res.json({
      success: true,
      message: 'Category deleted successfully',
      ...(result.productsUpdated > 0 && {
        note: `${result.productsUpdated} products were updated to remove category reference`,
      }),
    });
  }

  // Upload category image
  static async uploadCategoryImage(req, res) {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const imagePath = `uploads/categories/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Category image uploaded successfully',
      data: {
        filename: req.file.filename,
        path: imagePath,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  }

  static async deleteCategoryImage(req, res) {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required',
      });
    }

    const filePath = path.join(__dirname, '..', 'uploads/categories', filename);
    const result = await deleteFile(filePath);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Category image deleted successfully',
      });
    } else {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }
  }
}

module.exports = CategoryController;
