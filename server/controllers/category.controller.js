const Category = require('../models/category.model');
const { BACKEND_URL } = require('../configs/index');
const fs = require('fs').promises;
const path = require('path');

class CategoryController {
  static async createCategories(req, res) {
    const categoryData = { ...req.body };

    if (req.file) {
      categoryData.image = `${BACKEND_URL}/uploads/categories/${req.file.filename}`;
    }

    const categories = await Category.createCategories(categoryData);
    const isMultiple = Array.isArray(req.body);

    return res.status(201).json({
      success: true,
      message: isMultiple
        ? `${categories.length} categories created successfully`
        : 'Category created successfully',
      data: categories,
    });
  }

  static async getAllCategories(req, res) {
    const categories = await Category.find({}).sort({ name: 1 }).lean();

    return res.json({
      success: true,
      message: `Found ${categories.length} categories`,
      data: { categories },
    });
  }

  static async getCategoryById(req, res) {
    const category = await Category.findByIdWithValidation(req.params.id);

    return res.json({
      success: true,
      message: 'Category found successfully',
      data: category,
    });
  }

  static async getCategoryBySlug(req, res) {
    const { slug } = req.params;
    const { includeProducts, page = 1, limit = 10 } = req.query;

    const responseData = await Category.findBySlugWithProducts(slug, {
      includeProducts: includeProducts === 'true',
      page: parseInt(page),
      limit: parseInt(limit),
    });

    return res.json({
      success: true,
      message: 'Category found successfully',
      data: responseData,
    });
  }

  static async updateCategory(req, res) {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle image upload
    if (req.file) {
      updateData.image = `${BACKEND_URL}/uploads/categories/${req.file.filename}`;

      // Delete old image asynchronously (don't wait for it)
      CategoryController._deleteOldImage(id).catch(() => {
        // Silently handle error - old image deletion is not critical
      });
    }

    const updatedCategory = await Category.updateWithValidation(id, updateData);

    return res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory,
    });
  }

  static async deleteCategory(req, res) {
    const { id } = req.params;
    const { force } = req.query;

    const category = await Category.findByIdWithValidation(id);
    const result = await category.deleteWithProducts(force === 'true');

    // Delete category image asynchronously
    CategoryController._deleteCategoryImage(category.image).catch(() => {
      // Silently handle error - image deletion is not critical
    });

    const response = {
      success: true,
      message: 'Category deleted successfully',
      data: null,
    };

    if (result.productsUpdated > 0) {
      response.note = `${result.productsUpdated} products were updated to remove category reference`;
    }

    return res.json(response);
  }

  // Private helper method to delete old image
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
      // Silently handle - old image deletion is not critical
    }
  }

  // Private helper method to delete category image
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
      // Silently handle - image deletion is not critical
    }
  }
}

module.exports = CategoryController;
