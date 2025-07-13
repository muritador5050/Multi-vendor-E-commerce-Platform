const Vendor = require('../models/vendor.model');
const User = require('../models/user.model');
const EmailService = require('../services/emailService');

class VendorController {
  // Create or update vendor profile
  static async upsertVendorProfile(req, res) {
    try {
      const userId = req.user.id;

      // Check if user exists and has vendor role
      const user = await User.findById(userId);
      if (!user || user.role !== 'vendor') {
        return res.status(403).json({
          message: 'Only users with vendor role can create vendor profiles',
        });
      }

      // Upsert vendor profile
      const vendor = await Vendor.findOneAndUpdate(
        { userId },
        { userId, ...req.body },
        { new: true, upsert: true, runValidators: true }
      ).populate('user', '-password -refreshToken');

      const isNewVendor =
        !vendor.createdAt || vendor.createdAt === vendor.updatedAt;

      res.status(isNewVendor ? 201 : 200).json({
        message: `Vendor profile ${
          isNewVendor ? 'created' : 'updated'
        } successfully`,
        data: vendor,
      });
    } catch (error) {
      res.status(400).json({
        message: 'Error processing vendor profile',
        error: error.message,
      });
    }
  }

  // Get vendor profile (own profile)
  static async getVendorProfile(req, res) {
    try {
      const userId = req.user.id;
      const vendor = await Vendor.findOne({ userId }).populate(
        'user',
        '-password -refreshToken'
      );

      if (!vendor) {
        return res.status(404).json({
          message: 'Vendor profile not found',
        });
      }

      res.json({
        success: true,
        data: vendor,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching vendor profile',
        error: error.message,
      });
    }
  }

  // Get vendor by ID or slug (public)
  static async getVendor(req, res) {
    try {
      const { identifier } = req.params;
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

      const query = isObjectId
        ? { _id: identifier }
        : { storeSlug: identifier };
      const vendor = await Vendor.findOne(query).populate(
        'user',
        'name email avatar createdAt'
      );

      if (!vendor) {
        return res.status(404).json({
          message: 'Vendor not found',
        });
      }

      // Return only public information
      const publicFields = {
        id: vendor._id,
        businessName: vendor.businessName,
        storeName: vendor.storeName,
        storeDescription: vendor.storeDescription,
        storeLogo: vendor.storeLogo,
        storeSlug: vendor.storeSlug,
        rating: vendor.rating,
        reviewCount: vendor.reviewCount,
        businessHours: vendor.businessHours,
        socialMedia: vendor.socialMedia,
        verificationStatus: vendor.verificationStatus,
        user: vendor.user,
        createdAt: vendor.createdAt,
      };

      res.json({
        success: true,
        data: publicFields,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching vendor',
        error: error.message,
      });
    }
  }

  // Get all vendors with filters (public)
  static async getAllVendors(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Cap at 50
      const skip = (page - 1) * limit;

      const query = {
        verificationStatus: 'verified',
        isActive: true,
      };

      // Apply filters
      if (req.query.search) {
        query.$text = { $search: req.query.search };
      }
      if (req.query.businessType) {
        query.businessType = req.query.businessType;
      }

      const [vendors, total] = await Promise.all([
        Vendor.find(query)
          .select(
            'businessName storeName storeDescription storeLogo storeSlug rating reviewCount verificationStatus createdAt'
          )
          .populate('user', 'name email avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Vendor.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: vendors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching vendors',
        error: error.message,
      });
    }
  }

  // Admin: Get vendors with admin privileges
  static async getVendorsForAdmin(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 50);
      const skip = (page - 1) * limit;

      const query = {};
      if (req.query.status) query.verificationStatus = req.query.status;
      if (req.query.search) query.$text = { $search: req.query.search };

      const [vendors, total] = await Promise.all([
        Vendor.find(query)
          .populate('user', 'name email avatar createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Vendor.countDocuments(query),
      ]);

      res.json({
        success: true,
        data: vendors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching vendors for admin',
        error: error.message,
      });
    }
  }

  // Admin: Update verification status
  static async updateVerificationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const vendor = await Vendor.findByIdAndUpdate(
        id,
        {
          verificationStatus: status,
          verificationNotes: notes,
          verifiedAt: status === 'verified' ? new Date() : null,
          verifiedBy: req.user.id,
        },
        { new: true }
      ).populate('user', 'name email');

      if (!vendor) {
        return res.status(404).json({
          message: 'Vendor not found',
        });
      }

      // Send notification email
      if (status === 'verified') {
        await EmailService.sendVendorVerificationEmail(vendor.user, 'approved');
      } else if (status === 'rejected') {
        await EmailService.sendVendorVerificationEmail(
          vendor.user,
          'rejected',
          notes
        );
      }

      res.json({
        message: `Vendor ${status} successfully`,
        data: vendor,
      });
    } catch (error) {
      res.status(400).json({
        message: 'Error updating verification status',
        error: error.message,
      });
    }
  }

  // Manage documents (upload/delete)
  static async manageDocuments(req, res) {
    try {
      const userId = req.user.id;
      const { documentId } = req.params;
      const { documents } = req.body;

      let updateQuery;
      if (req.method === 'DELETE' && documentId) {
        // Delete document
        updateQuery = { $pull: { verificationDocuments: { _id: documentId } } };
      } else if (req.method === 'POST' && documents) {
        // Upload documents
        updateQuery = {
          $push: { verificationDocuments: { $each: documents } },
        };
      } else {
        return res.status(400).json({ message: 'Invalid request' });
      }

      const vendor = await Vendor.findOneAndUpdate({ userId }, updateQuery, {
        new: true,
      });

      if (!vendor) {
        return res.status(404).json({
          message: 'Vendor profile not found',
        });
      }

      res.json({
        message: `Documents ${
          req.method === 'DELETE' ? 'deleted' : 'uploaded'
        } successfully`,
        data: vendor.verificationDocuments,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error managing documents',
        error: error.message,
      });
    }
  }

  // Toggle account status
  static async toggleAccountStatus(req, res) {
    try {
      const userId = req.user.id;
      const { reason } = req.body;

      const vendor = await Vendor.findOne({ userId });
      if (!vendor) {
        return res.status(404).json({
          message: 'Vendor profile not found',
        });
      }

      const isDeactivating = vendor.isActive;
      const updateData = {
        isActive: !vendor.isActive,
      };

      if (isDeactivating) {
        updateData.deactivationReason = reason;
        updateData.deactivatedAt = new Date();
      } else {
        updateData.$unset = { deactivationReason: 1, deactivatedAt: 1 };
      }

      const updatedVendor = await Vendor.findByIdAndUpdate(
        vendor._id,
        updateData,
        { new: true }
      );

      res.json({
        message: `Vendor account ${
          isDeactivating ? 'deactivated' : 'reactivated'
        } successfully`,
        data: {
          isActive: updatedVendor.isActive,
          deactivatedAt: updatedVendor.deactivatedAt,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error toggling account status',
        error: error.message,
      });
    }
  }

  // Update vendor settings (notifications, business hours, social media)
  static async updateSettings(req, res) {
    try {
      const userId = req.user.id;
      const { settingType } = req.params;
      const allowedSettings = ['notifications', 'businessHours', 'socialMedia'];

      if (!allowedSettings.includes(settingType)) {
        return res.status(400).json({
          message: 'Invalid setting type',
        });
      }

      const updateData = { [settingType]: req.body[settingType] };

      const vendor = await Vendor.findOneAndUpdate({ userId }, updateData, {
        new: true,
        runValidators: true,
      });

      if (!vendor) {
        return res.status(404).json({
          message: 'Vendor profile not found',
        });
      }

      res.json({
        message: `${settingType} updated successfully`,
        data: vendor[settingType],
      });
    } catch (error) {
      res.status(400).json({
        message: `Error updating ${req.params.settingType}`,
        error: error.message,
      });
    }
  }

  // Get statistics (dashboard or admin)
  static async getStatistics(req, res) {
    try {
      const { type } = req.params;

      if (type === 'admin') {
        // Admin statistics
        const [
          totalVendors,
          verifiedVendors,
          pendingVendors,
          rejectedVendors,
          revenueAggregate,
          recentRegistrations,
        ] = await Promise.all([
          Vendor.countDocuments(),
          Vendor.countDocuments({ verificationStatus: 'verified' }),
          Vendor.countDocuments({ verificationStatus: 'pending' }),
          Vendor.countDocuments({ verificationStatus: 'rejected' }),
          Vendor.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: '$totalRevenue' } } },
          ]),
          Vendor.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5),
        ]);

        const stats = {
          totalVendors,
          verifiedVendors,
          pendingVendors,
          rejectedVendors,
          totalRevenue:
            revenueAggregate.length > 0 ? revenueAggregate[0].totalRevenue : 0,
          recentRegistrations,
        };

        res.json({ success: true, data: stats });
      } else {
        // Vendor dashboard statistics
        const userId = req.user.id;
        const vendor = await Vendor.findOne({ userId });

        if (!vendor) {
          return res.status(404).json({
            message: 'Vendor profile not found',
          });
        }

        const stats = {
          totalOrders: vendor.totalOrders || 0,
          totalRevenue: vendor.totalRevenue || 0,
          rating: vendor.rating || 0,
          reviewCount: vendor.reviewCount || 0,
          verificationStatus: vendor.verificationStatus,
        };

        res.json({ success: true, data: stats });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Error fetching statistics',
        error: error.message,
      });
    }
  }
}

module.exports = VendorController;
