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

    const categories = await Category.find()
      .paginate({
        page: parseInt(page),
        limit: parseInt(limit),
      })
      .searchByText(search)
      .sort({ name: 1 })
      .exec();

    const total = await Category.countDocuments(
      search ? { name: new RegExp(search, 'i') } : {}
    );

    return res.json({
      message: `We have ${categories.length} categories to choose from.`,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
      categories,
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

  // Get category tree with children
  static async getCategoryTree(req, res) {
    const categories = await Category.find({ parent: null }).populate(
      'children',
      'name slug'
    );

    res.json(resSuccessObject({ results: categories }));
  }
}

module.exports = CategoryController;
