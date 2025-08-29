const Category = require('../models/category.model');
const { BACKEND_URL } = require('../configs/index');
const fs = require('fs').promises;
const path = require('path');

class CategoryController {
  static async createCategories(req, res) {
    try {
      const categoryData = { ...req.body };

      if (req.file) {
        categoryData.image = `${BACKEND_URL}/uploads/categories/${req.file.filename}`;
      }

      const category = await Category.createOne(categoryData);

      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getAllCategories(req, res) {
    try {
      const categories = await Category.getAll();

      return res.json({
        success: true,
        message: `Found ${categories.length} categories`,
        data: { categories },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch categories',
      });
    }
  }

  static async getCategoryById(req, res) {
    try {
      const category = await Category.getById(req.params.id);

      return res.json({
        success: true,
        message: 'Category found successfully',
        data: category,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getCategoryBySlug(req, res) {
    try {
      const { slug } = req.params;
      const { includeProducts, page = 1, limit = 10 } = req.query;

      const category = await Category.getBySlug(slug);

      let responseData = category;

      if (includeProducts === 'true') {
        const productData = await category.getProductsWithPagination({
          page: parseInt(page),
          limit: parseInt(limit),
        });
        responseData = { ...category.toObject(), ...productData };
      }

      return res.json({
        success: true,
        message: 'Category found successfully',
        data: responseData,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      if (req.file) {
        updateData.image = `${BACKEND_URL}/uploads/categories/${req.file.filename}`;
        CategoryController._deleteOldImage(id).catch(() => {});
      }

      const updatedCategory = await Category.updateById(id, updateData);

      return res.json({
        success: true,
        message: 'Category updated successfully',
        data: updatedCategory,
      });
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const result = await Category.deleteById(id);

      const category = await Category.findById(id).select('image');
      if (category?.image) {
        CategoryController._deleteCategoryImage(category.image).catch(() => {});
      }

      return res.json({
        success: true,
        message: 'Category deleted successfully',
        data: null,
      });
    } catch (error) {
      const status = error.message.includes('not found') ? 404 : 400;
      return res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async _deleteCategoryImage(imageUrl) {
    try {
      if (
        imageUrl &&
        imageUrl !== '/default-images/category-placeholder.jpg' &&
        imageUrl.includes(BACKEND_URL)
      ) {
        const imagePath = imageUrl.replace(BACKEND_URL, '.');
        await fs.unlink(path.join(__dirname, '../', imagePath));
      }
    } catch (error) {
      // Silent fail - image deletion is not critical
    }
  }

  static async _deleteOldImage(categoryId) {
    try {
      const oldCategory = await Category.findById(categoryId).select('image');
      if (
        oldCategory?.image &&
        oldCategory.image !== '/default-images/category-placeholder.jpg' &&
        oldCategory.image.includes(BACKEND_URL)
      ) {
        const oldImagePath = oldCategory.image.replace(BACKEND_URL, '.');
        await fs.unlink(path.join(__dirname, '../', oldImagePath));
      }
    } catch (error) {
      // Silent fail - image deletion is not critical
    }
  }
}
module.exports = CategoryController;
