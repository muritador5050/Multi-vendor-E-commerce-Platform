const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

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

    // 1. General Settings
    generalSettings: {
      storeName: {
        type: String,
        trim: true,
      },
      storeSlug: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
      },
      storeEmail: {
        type: String,
        trim: true,
        lowercase: true,
      },
      storePhone: {
        type: String,
        trim: true,
      },
      storeLogo: String,
      shopDescription: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
      storeBannerType: {
        type: String,
        enum: ['image', 'video', 'slider'],
        default: 'image',
      },
      storeBanner: String,
    },

    // 2. Store Address
    storeAddress: {
      street: String,
      apartment: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      latitude: Number,
      longitude: Number,
    },

    businessAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    // 3. Bank Details
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      routingNumber: String,
      swiftCode: String,
      accountType: {
        type: String,
        enum: ['checking', 'savings', 'business'],
      },
    },

    // 4. Social Media
    socialMedia: {
      website: String,
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
      youtube: String,
      tiktok: String,
    },

    // 5. Store Policies
    storePolicies: {
      returnPolicy: {
        type: String,
        maxlength: 2000,
      },
      shippingPolicy: {
        type: String,
        maxlength: 2000,
      },
      privacyPolicy: {
        type: String,
        maxlength: 2000,
      },
      termsOfService: {
        type: String,
        maxlength: 2000,
      },
      refundPolicy: {
        type: String,
        maxlength: 2000,
      },
    },

    // 6. Shipping Rules
    shippingRules: {
      freeShippingThreshold: {
        type: Number,
        default: 0,
      },
      shippingZones: [
        {
          name: String,
          countries: [String],
          shippingCost: Number,
          estimatedDelivery: String,
        },
      ],
      processingTime: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          enum: ['days', 'weeks'],
          default: 'days',
        },
      },
    },

    // 7. SEO Settings
    seoSettings: {
      metaTitle: {
        type: String,
        maxlength: 60,
      },
      metaDescription: {
        type: String,
        maxlength: 160,
      },
      keywords: [String],
      ogImage: String,
      structuredData: mongoose.Schema.Types.Mixed,
    },

    // 8. Store Hours
    storeHours: [
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
        breaks: [
          {
            startTime: String,
            endTime: String,
            reason: String,
          },
        ],
      },
    ],

    // Payment Terms
    paymentTerms: {
      type: String,
      enum: ['net15', 'net30', 'net45', 'net60', 'immediate'],
      default: 'net30',
    },

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
      default: 1,
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

    // Account Status
    deactivationReason: String,
    deactivatedAt: Date,

    // Notification Settings
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
      marketingEmails: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index
vendorSchema.index({
  'generalSettings.storeName': 'text',
  businessName: 'text',
});

// Virtual for user details
vendorSchema.virtual('userDetails', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name email -password -refreshToken -tokenVersion' },
});

vendorSchema.pre('save', function (next) {
  if (
    this.isModified('generalSettings.storeName') &&
    this.generalSettings?.storeName &&
    !this.generalSettings?.storeSlug
  ) {
    this.generalSettings.storeSlug = this.generalSettings.storeName
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
  return this.findOne({ user: userId }).populate(
    'user',
    '-password -refreshToken'
  );
};

vendorSchema.statics.findByIdentifier = function (identifier) {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const query = isObjectId
    ? { _id: identifier }
    : { 'generalSettings.storeSlug': identifier };

  return this.findOne(query).populate('user', 'name email avatar createdAt');
};

// Instance Methods
vendorSchema.methods.updateVendorSettings = function (
  settingType,
  settingData
) {
  const allowedSettings = [
    'generalSettings',
    'storeAddress',
    'bankDetails',
    'socialMedia',
    'storePolicies',
    'shippingRules',
    'seoSettings',
    'storeHours',
    'notifications',
  ];

  if (!allowedSettings.includes(settingType)) {
    throw new Error('Invalid setting type');
  }

  if (settingType === 'storeHours') {
    this[settingType] = settingData;
  } else if (this[settingType] && typeof this[settingType] === 'object') {
    this[settingType] = { ...this[settingType].toObject(), ...settingData };
  } else {
    this[settingType] = settingData;
  }

  return this.save({ validateBeforeSave: true });
};

vendorSchema.methods.calculateProfileCompletion = function () {
  const requiredFields = [
    'businessName',
    'businessType',
    'generalSettings.storeName',
    'generalSettings.shopDescription',
    'storeAddress.street',
    'storeAddress.city',
    'storeAddress.state',
    'storeAddress.zipCode',
    'storeAddress.country',
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
    _id: this._id,
    businessName: this.businessName,
    generalSettings: this.generalSettings,
    storeAddress: this.storeAddress,
    socialMedia: this.socialMedia,
    storeHours: this.storeHours,
    rating: this.rating,
    reviewCount: this.reviewCount,
    verificationStatus: this.verificationStatus,
    user: this.user,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Vendor', vendorSchema);
