const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: { type: String, unique: true, trim: true, lowercase: true },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

//Query helper
categorySchema.query.paginate = function ({ page, limit }) {
  const skip = limit * (page - 1);
  return this.skip(skip).limit(limit);
};

// Category filter
categorySchema.query.filterParent = function (parent) {
  if (parent != undefined) {
    return this.where('parent').equals(null) ? null : parent;
  }
  return this;
};

// Search filter
categorySchema.query.searchByText = function (search) {
  if (search) {
    return this.or([
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]);
  }
  return this;
};

// Active filter
categorySchema.query.activeFilter = function (isActive) {
  if (isActive != undefined) {
    return this.where('isActive').equals(isActive === 'true');
  }
  return this;
};

// Auto-generate slug
categorySchema.pre('save', async function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Virtual for children
// categorySchema.virtual('children', {
//   ref: 'Category',
//   localField: '_id',
//   foreignField: 'parent',
// });
// categorySchema.set('toJSON', { virtuals: true });
// categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);
