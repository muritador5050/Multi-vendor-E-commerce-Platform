const Category = require('../models/category.model');
const { resSuccessObject } = require('../utils/responseObject');

class CategoryController {
  // Create a new category
  static async createCategory(req, res) {
    const { name, description, image, parent, isActive = true } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    // Check if parent exists if provided
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(404).json({
          success: false,
          message: 'Parent category not found',
        });
      }
    }

    const category = await Category.create({
      name,
      description,
      image,
      parent: parent || null,
      isActive,
    });

    // Populate parent for response
    await category.populate('parent', 'name slug');

    return res.json(resSuccessObject({ results: category }));
  }

  static async getAllCategories(req, res) {
    const { page = 1, limit = 10, isActive, parent, search } = req.query;

    const categories = await Category.find()
      .paginate({
        page: parseInt(page),
        limit: parseInt(limit),
      })
      .activeFilter(isActive)
      .searchByText(search)
      .filterParent(parent)
      .sort({ name: 1 })
      // .populate('parent', 'name slug')
      .populate('children', 'name slug image')
      .exec();

    const total = await Category.countDocuments(categories);

    return res.json({
      count: categories.length,
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
    let category;

    // Check if it's a valid ObjectId or treat as slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id)
        .populate('parent', 'name slug')
        .populate('children', 'name slug');
    } else {
      category = await Category.findOne({ slug: id })
        .populate('parent', 'name slug')
        .populate('children', 'name slug');
    }

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
    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Prevent self-referencing
    if (req.body.parent && req.body.parent === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Category cannot be its own parent',
      });
    }
    // Check if parent exists
    if (req.body.parent) {
      const parentCategory = await Category.findById(req.body.parent);
      if (!parentCategory) {
        return res.status(404).json({
          success: false,
          message: 'Parent category not found',
        });
      }
    }
    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
      }
    ).populate('parent', 'name slug');
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
