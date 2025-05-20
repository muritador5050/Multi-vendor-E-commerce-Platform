const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    price: { type: String, required: true, min: 0 },
    discount: { type: Number, min: 0, max: 100, default: 0 }, //percentage discount
    quantityInStock: { type: Number, default: 0, min: 0 },
    images: [{ type: String }], //Array of image URLs or path
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    attributes: mongoose.Schema.Types.Mixed, // e.g. { color: 'red', size: 'M' }
    averageRating: { type: Number, min: 0, max: 5, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // if marketplace
  },
  { timestamps: true }
);

//Indexes
productSchema.index({ categories: 1 });

//Query helper
productSchema.query.paginate = function ({ page, limit }) {
  const skip = limit * (page - 1);
  return this.skip(skip).limit(limit);
};

// Category filter
productSchema.query.filterByCategory = function (category) {
  if (category) {
    return this.where('categories').equals(category);
  }
  return this;
};

// Price range filter
productSchema.query.priceRangeFilter = function (minPrice, maxPrice) {
  if (minPrice || maxPrice) {
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = parseFloat(minPrice);
    if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
    return this.where('price')
      .gte(priceFilter.$gte || 0)
      .lte(priceFilter.$lte || Infinity);
  }
  return this;
};

// Search filter
productSchema.query.searchByText = function (search) {
  if (search) {
    return this.or([
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]);
  }
  return this;
};

// Active filter
productSchema.query.activeFilter = function (isActive) {
  if (isActive != undefined) {
    return this.where('isActive').equals(isActive === 'true');
  }
  return this;
};

module.exports = mongoose.model('Product', productSchema);
