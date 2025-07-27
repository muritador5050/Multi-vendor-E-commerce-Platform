const mongoose = require('mongoose');

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

    // Business Contact (only if different from user's contact info)
    businessAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
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

    // Verification (vendor-specific status)
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

    // Performance Metrics
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

    commission: {
      type: Number,
      default: 0.1,
      min: 0,
      max: 1,
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

    // Account Status (vendor-specific deactivation)
    deactivationReason: String,
    deactivatedAt: Date,

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

// Indexes - Fixed: removed isActive index since it's not in schema
vendorSchema.index({ verificationStatus: 1 });
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

// Static Methods
vendorSchema.statics.findByUserId = function (userId) {
  return this.findOne({ userId }).populate('user', '-password -refreshToken');
};

vendorSchema.statics.findVerifiedVendors = function () {
  return this.find({ verificationStatus: 'verified' }).populate(
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

vendorSchema.statics.buildQuery = function (filters) {
  const query = {};

  if (filters.search) query.$text = { $search: filters.search };
  if (filters.status) query.verificationStatus = filters.status;
  if (filters.businessType) query.businessType = filters.businessType;
  if (filters.verified) {
    query.verificationStatus = 'verified';
  }

  return query;
};

vendorSchema.statics.buildPagination = function (page = 1, limit = 10) {
  const normalizedLimit = Math.min(parseInt(limit), 50);
  const normalizedPage = parseInt(page);
  const skip = (normalizedPage - 1) * normalizedLimit;

  return { page: normalizedPage, limit: normalizedLimit, skip };
};

vendorSchema.statics.findByIdentifier = function (identifier) {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const query = isObjectId ? { _id: identifier } : { storeSlug: identifier };

  return this.findOne(query).populate('user', 'name email avatar createdAt');
};

vendorSchema.statics.findWithPagination = function (
  query,
  page,
  limit,
  populateOptions = '',
  selectFields = ''
) {
  const { skip, limit: normalizedLimit } = this.buildPagination(page, limit);

  const findQuery = this.find(query);

  if (selectFields) findQuery.select(selectFields);
  if (populateOptions) findQuery.populate(populateOptions);

  return Promise.all([
    findQuery.sort({ createdAt: -1 }).skip(skip).limit(normalizedLimit),
    this.countDocuments(query),
  ]);
};

vendorSchema.statics.getAdminStatistics = async function () {
  const [
    totalVendors,
    verifiedVendors,
    pendingVendors,
    rejectedVendors,
    revenueAggregate,
    recentRegistrations,
  ] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ verificationStatus: 'verified' }),
    this.countDocuments({ verificationStatus: 'pending' }),
    this.countDocuments({ verificationStatus: 'rejected' }),
    this.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalRevenue' } } },
    ]),
    this.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
  ]);

  return {
    totalVendors,
    verifiedVendors,
    pendingVendors,
    rejectedVendors,
    totalRevenue:
      revenueAggregate.length > 0 ? revenueAggregate[0].totalRevenue : 0,
    recentRegistrations,
  };
};

vendorSchema.statics.updateVerificationStatus = function (
  id,
  status,
  notes,
  verifiedBy
) {
  return this.findByIdAndUpdate(
    id,
    {
      verificationStatus: status,
      verificationNotes: notes,
      verifiedAt: status === 'verified' ? new Date() : null,
      verifiedBy,
    },
    { new: true }
  ).populate('user', 'name email');
};

// Instance Methods
vendorSchema.methods.updateRating = async function (newRating) {
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

vendorSchema.methods.getPublicFields = function () {
  return {
    id: this._id,
    businessName: this.businessName,
    storeName: this.storeName,
    storeDescription: this.storeDescription,
    storeLogo: this.storeLogo,
    storeSlug: this.storeSlug,
    rating: this.rating,
    reviewCount: this.reviewCount,
    businessHours: this.businessHours,
    socialMedia: this.socialMedia,
    verificationStatus: this.verificationStatus,
    user: this.user,
    createdAt: this.createdAt,
  };
};

vendorSchema.methods.getDashboardStats = function () {
  return {
    totalOrders: this.totalOrders || 0,
    totalRevenue: this.totalRevenue || 0,
    rating: this.rating || 0,
    reviewCount: this.reviewCount || 0,
    verificationStatus: this.verificationStatus,
  };
};

// Fixed: Removed isActive references since it's not in schema
vendorSchema.methods.toggleStatus = function (reason) {
  const isDeactivating = !this.deactivatedAt;

  if (isDeactivating) {
    this.deactivationReason = reason;
    this.deactivatedAt = new Date();
  } else {
    this.deactivationReason = undefined;
    this.deactivatedAt = undefined;
  }

  return this.save();
};

vendorSchema.methods.updateSettings = function (settingType, settingData) {
  const allowedSettings = ['notifications', 'businessHours', 'socialMedia'];

  if (!allowedSettings.includes(settingType)) {
    throw new Error('Invalid setting type');
  }

  this[settingType] = settingData;
  return this.save({ validateBeforeSave: true });
};

vendorSchema.methods.manageDocuments = function (action, data) {
  if (action === 'add' && data.documents) {
    this.verificationDocuments.push(...data.documents);
  } else if (action === 'remove' && data.documentId) {
    this.verificationDocuments.id(data.documentId).remove();
  }

  return this.save();
};

module.exports = mongoose.model('Vendor', vendorSchema);
