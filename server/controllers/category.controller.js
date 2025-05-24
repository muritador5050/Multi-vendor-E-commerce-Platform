const Category = require('../models/category.model');
const { resSuccessObject } = require('../utils/responseObject');

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

    const category = await Category.create({
      name,
      image,
    });

    return res.json(
      resSuccessObject({
        results: category,
      })
    );
  }

  static async getAllCategories(req, res) {
    const { page = 1, limit = 10, search } = req.query;

    // Check for invalid page or limit values
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ message: 'Invalid page or limit values.' });
    }

    const query = search ? { name: new RegExp(search, 'i') } : {};

    const categories = await Category.find(query)
      .paginate({
        page: parseInt(page),
        limit: parseInt(limit),
      })
      .sort({ name: 1 })
      .exec();

    // For counting, use the same filter logic
    const total = await Category.countDocuments(query);

    return res.json({
      message: `We have ${categories.length} categories to choose from.`,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
      },
      categories,
    });
  }

  static async getCategoryBySlug(req, res) {
    const { slug } = req.params; // Get slug from URL parameters

    if (!slug) {
      return res.status(400).json({ message: 'Slug parameter is required.' });
    }

    const category = await Category.findOne({ slug: slug });

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    return res.json({
      message: 'Category found successfully.',
      category,
    });
  }

  static async getCategoryById(req, res) {
    const { id } = req.params;
    let category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    return res.json(resSuccessObject({ results: category }));
  }

  static async updateCategory(req, res) {
    //Check for existing category
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update fields
    Object.assign(category, req.body);

    // Save (this will trigger pre('save') middleware)
    const updated = await category.save();
    res.json(resSuccessObject({ results: updated }));
  }

  // Delete category
  static async deleteCategory(req, res) {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: 'Category not found' });
    res.json(resSuccessObject({ message: 'Category deleted' }));
  }
}

module.exports = CategoryController;
