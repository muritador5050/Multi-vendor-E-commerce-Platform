const Category = require('../models/category.model');

class CategoryController {
  // Create a new category
  static async createCategory(req, res) {
    const { name, image } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: `Category ${name} already exists`,
      });
    }

    // Create single category with provided name and image
    const category = await Category.create({ name, image });

    return res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  }

  // Bulk create categories from predefined list
  static async createBulkCategories(req, res) {
    const categories = req.body;

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Categories must be a non-empty array',
      });
    }

    for (const category of categories) {
      if (
        !category.name ||
        typeof category.name !== 'string' ||
        category.name.trim() === ''
      ) {
        return res.status(400).json({
          success: false,
          message: 'Each category must have a valid name',
        });
      }
    }

    // Optional: prevent inserting duplicates
    const existingNames = await Category.find({
      name: { $in: categories.map((c) => c.name) },
    });

    if (existingNames.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some categories already exist: ${existingNames
          .map((e) => e.name)
          .join(', ')}`,
      });
    }

    // Add slug field if needed
    const slugify = require('slugify');
    const categoriesWithSlugs = categories.map((c) => ({
      ...c,
      slug: slugify(c.name, { lower: true }),
    }));

    const createdCategories = await Category.insertMany(categoriesWithSlugs);

    return res.status(201).json({
      success: true,
      data: createdCategories.map((cat) => cat.toPublicJSON?.() || cat),
      message: `${createdCategories.length} categories created successfully`,
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

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Slug parameter is required.',
      });
    }

    const category = await Category.findOne({ slug: slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    return res.json({
      success: true,
      message: 'Category found successfully.',
      data: category.toPublicJSON(),
    });
  }

  static async getCategoryById(req, res) {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    return res.json({
      data: category.toPublicJSON(),
    });
  }

  static async updateCategory(req, res) {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({
        name: req.body.name,
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists',
        });
      }
    }

    // Update fields
    Object.assign(category, req.body);

    const updated = await category.save();

    return res.json({
      data: updated.toPublicJSON(),
      message: 'Category updated successfully',
    });
  }

  // Delete category
  static async deleteCategory(req, res) {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID format',
      });
    }

    const deleted = await Category.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    return res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  }
}

module.exports = CategoryController;
