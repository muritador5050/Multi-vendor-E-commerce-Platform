const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      default: 'Multivendor E-commerce platform',
      required: true,
    },
    adminEmail: {
      type: String,
      default: 'muritador5050@gmail.com',
      required: true,
    },
    commissionRate: {
      type: Number,
      default: 5,
      min: 0,
      max: 100,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
