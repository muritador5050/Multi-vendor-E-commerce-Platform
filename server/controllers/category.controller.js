const Category = require('../models/category.model');
const Product = require('../models/product.model');
const slugify = require('slugify');

class CategoryController {
  static async createCategory(req, res) {
    const { name, image } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: `Category ${name} already exists`,
      });
    }

    const category = await Category.create({
      name,
      image,
      slug: slugify(name, { lower: true, strict: true }),
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  }

  static async createBulkCategories(req, res) {
    const categories = req.body;

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Categories must be a non-empty array',
      });
    }

    for (const category of categories) {
      if (!category.name?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Each category must have a valid name',
        });
      }
    }

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

    const createdCategories = await Category.insertMany(
      categories.map((c) => ({
        ...c,
        slug: slugify(c.name, { lower: true, strict: true }),
      }))
    );

    return res.status(201).json({
      success: true,
      message: `${createdCategories.length} categories created successfully`,
      data: createdCategories,
    });
  }

  static async getAllCategories(req, res) {
    const categories = await Category.find({}).sort({ name: 1 });

    if (!categories) {
      res.json({
        success: false,
        message: 'Error in fetching categories',
      });
    }

    return res.json({
      success: true,
      message: `Found ${categories.length} categories`,
      data: categories,
    });
  }

  static async getCategoryBySlug(req, res) {
    const { slug } = req.params;
    const { includeProducts, page = 1, limit = 10 } = req.query;

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

    if (includeProducts === 'true') {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const parsedLimit = parseInt(limit);

      const [products, totalProducts] = await Promise.all([
        Product.find({
          category: category._id,
          isDeleted: false,
          isActive: true,
        })
          .sort('-createdAt')
          .skip(skip)
          .limit(parsedLimit)
          .populate('vendor', 'name')
          .lean(),
        Product.countDocuments({
          category: category._id,
          isDeleted: false,
          isActive: true,
        }),
      ]);

      responseData.products = products;
      responseData.productCount = totalProducts;
      responseData.pagination = {
        page: parseInt(page),
        limit: parsedLimit,
        total: totalProducts,
        pages: Math.ceil(totalProducts / parsedLimit),
      };
    }

    return res.json({
      success: true,
      message: 'Category found successfully.',
      data: responseData,
    });
  }

  static isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  static async getCategoryById(req, res) {
    const { id } = req.params;

    if (!this.isValidObjectId(id)) {
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

    if (!this.isValidObjectId(id)) {
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
        _id: { $ne: id },
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category name already exists',
        });
      }
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

  static async deleteCategory(req, res) {
    const { id } = req.params;
    const { force } = req.query;

    if (!this.isValidObjectId(id)) {
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
