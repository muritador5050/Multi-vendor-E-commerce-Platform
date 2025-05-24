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

// Search filter
categorySchema.query.searchByText = function (search) {
  if (search) {
    return this.where({ name: { $regex: search, $options: 'i' } });
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

module.exports = mongoose.model('Category', categorySchema);
