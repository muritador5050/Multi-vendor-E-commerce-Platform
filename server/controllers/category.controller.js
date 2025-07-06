const Category = require('../models/category.model');
const Product = require('../models/product.model');
const slugify = require('slugify');

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

    // Create category with auto-generated slug
    const categoryData = {
      name,
      image,
      slug: slugify(name, { lower: true, strict: true }),
    };

    const category = await Category.create(categoryData);

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

    // Validate each category
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

    // Check for existing categories
    const categoryNames = categories.map((c) => c.name);
    const existingCategories = await Category.find({
      name: { $in: categoryNames },
    });

    if (existingCategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Some categories already exist: ${existingCategories
          .map((e) => e.name)
          .join(', ')}`,
      });
    }

    // Add slug field to each category
    const categoriesWithSlugs = categories.map((c) => ({
      ...c,
      slug: slugify(c.name, { lower: true, strict: true }),
    }));

    const createdCategories = await Category.insertMany(categoriesWithSlugs);

    return res.status(201).json({
      success: true,
      data: createdCategories,
      message: `${createdCategories.length} categories created successfully`,
    });
  }

  // Get all categories with optional product count
  static async getAllCategories(req, res) {
    const { includeProductCount = false } = req.query;

    let categories;

    if (includeProductCount === 'true') {
      // Aggregate to include product count
      categories = await Category.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'category',
            as: 'products',
          },
        },
        {
          $addFields: {
            productCount: { $size: '$products' },
          },
        },
        {
          $project: {
            products: 0, // Remove the products array, keep only count
          },
        },
        {
          $sort: { name: 1 },
        },
      ]);
    } else {
      categories = await Category.find({}).sort({ name: 1 });
    }

    return res.json({
      success: true,
      message: `Found ${categories.length} categories`,
      data: categories,
    });
  }

  // Get category by slug with optional products
  static async getCategoryBySlug(req, res) {
    const { slug } = req.params;
    const { includeProducts = false, page = 1, limit = 10 } = req.query;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Slug parameter is required.',
      });
    }

    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    let responseData = category.toObject();

    // Include products if requested
    if (includeProducts === 'true') {
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const products = await Product.find({
        category: category._id,
        isDeleted: false,
        isActive: true,
      })
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .populate('vendor', 'name')
        .lean();

      const totalProducts = await Product.countDocuments({
        category: category._id,
        isDeleted: false,
        isActive: true,
      });

      responseData.products = products;
      responseData.productCount = totalProducts;
      responseData.pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalProducts,
        pages: Math.ceil(totalProducts / parseInt(limit)),
      };
    }

    return res.json({
      success: true,
      message: 'Category found successfully.',
      data: responseData,
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
      success: true,
      data: category,
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

    // Check for name uniqueness if name is being updated
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({
        name: req.body.name,
        _id: { $ne: id },
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists',
        });
      }
      // Auto-generate slug if name changes
      req.body.slug = slugify(req.body.name, { lower: true, strict: true });
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.json({
      success: true,
      data: updatedCategory,
      message: 'Category updated successfully',
    });
  }

  // Delete category with safety check
  static async deleteCategory(req, res) {
    const { id } = req.params;
    const { force = false } = req.query;

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

    // Check if category has products
    const productCount = await Product.countDocuments({
      category: id,
      isDeleted: false,
    });

    if (productCount > 0 && force !== 'true') {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${productCount} products associated with it. Use ?force=true to delete anyway.`,
        productCount,
      });
    }

    // If force delete, update products to remove category reference
    if (force === 'true' && productCount > 0) {
      await Product.updateMany({ category: id }, { $unset: { category: 1 } });
    }

    await Category.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Category deleted successfully',
      ...(productCount > 0 && {
        note: `${productCount} products were updated to remove category reference`,
      }),
    });
  }
}

module.exports = CategoryController;
