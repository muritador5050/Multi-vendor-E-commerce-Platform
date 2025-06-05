const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - categoryId
 *       properties:
 *         name:
 *           type: string
 *           example: "Sample Product"
 *         description:
 *           type: string
 *           example: "This is a sample product description."
 *         slug:
 *           type: string
 *           example: "sample-product"
 *         price:
 *           type: number
 *           format: float
 *           example: 19.99
 *         discount:
 *           type: number
 *           format: float
 *           example: 10
 *         quantityInStock:
 *           type: number
 *           example: 100
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             example: "https://example.com/image.jpg"
 *         categoryId:
 *           type: string
 *           example: "60d5f484f1b2c8b8f8e4c8b8"
 *         attributes:
 *           type: object
 *           additionalProperties:
 *             type: string
 *         averageRating:
 *           type: number
 *           format: float
 *           example: 4.5
 *         totalReviews:
 *           type: number
 *           example: 25
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    slug: { type: String, unique: true, trim: true, lowercase: true },
    price: {
      type: Number,
      required: true,
      min: 0.01,
    },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    quantityInStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    categoryId: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    attributes: {
      type: Map,
      of: String,
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Indexes for better performance
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1, isDeleted: 1 });

//Query helper
productSchema.query.paginate = function ({ page, limit }) {
  const skip = limit * (page - 1);
  return this.skip(skip).limit(limit);
};

// Auto-generate slug
productSchema.pre('save', async function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
