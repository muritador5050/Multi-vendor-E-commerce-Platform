const mongoose = require('mongoose');

/**
 * @openapi
 * components:
 *   schemas:
 *     VendorProfile:
 *       type: object
 *       required:
 *         - businessName
 *         - businessType
 *       properties:
 *         businessName:
 *           type: string
 *           example: "John's Electronics Store"
 *         businessType:
 *           type: string
 *           enum: [individual, company, partnership, corporation]
 *           example: "company"
 *         taxId:
 *           type: string
 *           example: "123-45-6789"
 *         businessRegistrationNumber:
 *           type: string
 *           example: "REG123456"
 *         businessAddress:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *               example: "456 Business Ave"
 *             city:
 *               type: string
 *               example: "Commerce City"
 *             state:
 *               type: string
 *               example: "NY"
 *             zipCode:
 *               type: string
 *               example: "10002"
 *             country:
 *               type: string
 *               example: "USA"
 *         businessPhone:
 *           type: string
 *           example: "+1-555-123-4567"
 *         businessEmail:
 *           type: string
 *           example: "business@johnselectronics.com"
 *         verificationStatus:
 *           type: string
 *           enum: [pending, verified, rejected, suspended]
 *           example: "pending"
 *         bankDetails:
 *           type: object
 *           properties:
 *             accountName:
 *               type: string
 *               example: "John's Electronics Store"
 *             accountNumber:
 *               type: string
 *               example: "****1234"
 *             bankName:
 *               type: string
 *               example: "First National Bank"
 *         paymentTerms:
 *           type: string
 *           enum: [net15, net30, net45, net60, immediate]
 *           example: "net30"
 *         storeName:
 *           type: string
 *           example: "John's Electronics"
 *         storeDescription:
 *           type: string
 *           example: "Quality electronics and gadgets"
 *         storeLogo:
 *           type: string
 *           example: "https://example.com/logo.png"
 *         storeSlug:
 *           type: string
 *           example: "johns-electronics"
 *         commission:
 *           type: number
 *           example: 0.10
 *         rating:
 *           type: number
 *           example: 4.5
 *         totalOrders:
 *           type: number
 *           example: 150
 *         totalRevenue:
 *           type: number
 *           example: 25000.50
 *         isActive:
 *           type: boolean
 *           example: true
 */

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // Business Information
    businessName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    businessType: {
      type: String,
      enum: ['individual', 'company', 'partnership', 'corporation'],
      required: true,
    },
    taxId: {
      type: String,
      trim: true,
    },
    businessRegistrationNumber: {
      type: String,
      trim: true,
    },

    // Contact & Address
    businessAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    businessPhone: {
      type: String,
      trim: true,
    },
    businessEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },

    // Financial Information
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      routingNumber: String,
      swiftCode: String,
    },
    paymentTerms: {
      type: String,
      enum: ['net15', 'net30', 'net45', 'net60', 'immediate'],
      default: 'net30',
    },

    // Verification & Status
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'suspended'],
      default: 'pending',
      index: true,
    },
    verificationDocuments: [
      {
        type: {
          type: String,
          enum: [
            'business_license',
            'tax_certificate',
            'bank_statement',
            'id_document',
            'other',
          ],
        },
        filename: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    verificationNotes: String,
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Business Metrics
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Settings
    commission: {
      type: Number,
      default: 0.1,
      min: 0,
      max: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Store Information
    storeName: {
      type: String,
      trim: true,
    },
    storeDescription: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    storeLogo: String,
    storeSlug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
    },
    storeBanner: String,

    // Additional Settings
    notifications: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
      orderNotifications: {
        type: Boolean,
        default: true,
      },
    },

    // Business Hours
    businessHours: [
      {
        day: {
          type: String,
          enum: [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
            'sunday',
          ],
        },
        isOpen: {
          type: Boolean,
          default: true,
        },
        openTime: String,
        closeTime: String,
      },
    ],

    // Social Media Links
    socialMedia: {
      website: String,
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

vendorSchema.index({ isActive: 1 });
vendorSchema.index({ businessName: 'text', storeName: 'text' });

// Virtual for user information
vendorSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Pre-save middleware to generate store slug
vendorSchema.pre('save', function (next) {
  if (this.isModified('storeName') && this.storeName && !this.storeSlug) {
    this.storeSlug = this.storeName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
  next();
});

// Static methods
vendorSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId }).populate('user', '-password -refreshToken');
};

vendorSchema.statics.findVerifiedVendors = function () {
  return this.find({ verificationStatus: 'verified', isActive: true }).populate(
    'user',
    'name email avatar'
  );
};

vendorSchema.statics.findPendingVerification = function () {
  return this.find({ verificationStatus: 'pending' }).populate(
    'user',
    'name email createdAt'
  );
};

// Instance methods
vendorSchema.methods.updateRating = async function (newRating) {
  // This would typically be called when a new review is added
  // You'd calculate the average from all reviews
  this.rating = newRating;
  this.reviewCount += 1;
  return this.save();
};

vendorSchema.methods.incrementOrders = async function (orderValue = 0) {
  this.totalOrders += 1;
  this.totalRevenue += orderValue;
  return this.save();
};

vendorSchema.methods.calculateProfileCompletion = function () {
  const requiredFields = [
    'businessName',
    'businessType',
    'businessPhone',
    'businessEmail',
    'businessAddress.street',
    'businessAddress.city',
    'businessAddress.state',
    'businessAddress.zipCode',
    'businessAddress.country',
    'storeName',
    'storeDescription',
    'bankDetails.accountName',
    'bankDetails.accountNumber',
    'bankDetails.bankName',
  ];

  let completedFields = 0;

  requiredFields.forEach((field) => {
    const value = field.split('.').reduce((obj, key) => obj && obj[key], this);
    if (value && value.toString().trim()) {
      completedFields++;
    }
  });

  return Math.round((completedFields / requiredFields.length) * 100);
};

module.exports = mongoose.model('Vendor', vendorSchema);
