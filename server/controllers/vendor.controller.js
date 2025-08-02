const Vendor = require('../models/vendor.model');
const User = require('../models/user.model');
const EmailService = require('../services/emailService');
const path = require('path');
const { BACKEND_URL } = require('../configs/index');

//Controller
class VendorController {
  static async updateVendorData(req, res) {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'vendor') {
      return res.status(403).json({
        message: 'Only users with vendor role can update vendor data',
      });
    }

    try {
      let vendor = await Vendor.findOne({ user: req.user.id });

      if (!vendor) {
        vendor = new Vendor({ user: req.user.id, ...req.body });
        await vendor.save();

        return res.status(201).json({
          success: true,
          message: 'Vendor profile created successfully',
          data: {
            ...vendor.toObject(),
            profileCompletion: vendor.calculateProfileCompletion(),
          },
        });
      }

      // Update existing vendor
      Object.assign(vendor, req.body);
      await vendor.save();

      res.status(200).json({
        success: true,
        message: 'Vendor profile updated successfully',
        data: {
          ...vendor.toObject(),
          profileCompletion: vendor.calculateProfileCompletion(),
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating vendor data',
        error: error.message,
      });
    }
  }

  static async updateSettings(req, res) {
    try {
      const vendor = await Vendor.findOne({ user: req.user.id });

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor profile not found',
        });
      }

      const { settingType } = req.params;
      let settingData = req.body;

      if (settingType === 'generalSettings') {
        if (req.files) {
          if (req.files.storeLogo && req.files.storeLogo[0]) {
            settingData.storeLogo = `${BACKEND_URL}/uploads/storeLogo/${req.files.storeLogo[0].filename}`;
          }
          if (req.files.storeBanner && req.files.storeBanner[0]) {
            settingData.storeBanner = `${BACKEND_URL}/uploads/storeBanner/${req.files.storeBanner[0].filename}`;
          }
        }
      }

      await vendor.updateVendorSettings(settingType, settingData);

      res.json({
        success: true,
        message: `${settingType} updated successfully`,
        data: vendor[settingType],
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getVendorProfile(req, res) {
    try {
      const vendor = await Vendor.findOne({ user: req.user.id }).populate(
        'user',
        '-password -refreshToken -tokenVersion'
      );

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor profile not found',
        });
      }

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          ...vendor.toObject(),
          profileCompletion: vendor.calculateProfileCompletion(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving vendor profile',
        error: error.message,
      });
    }
  }

  static async getProfileCompletion(req, res) {
    try {
      const vendor = await Vendor.findOne({ user: req.user.id });

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor profile not found',
        });
      }

      const completion = vendor.calculateProfileCompletion();

      res.json({
        success: true,
        data: {
          profileCompletion: completion,
          isComplete: completion === 100,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error calculating profile completion',
        error: error.message,
      });
    }
  }

  static async getVendorById(req, res) {
    try {
      const vendor = await Vendor.findByIdentifier(req.params.id);

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found',
        });
      }

      res.json({
        success: true,
        data: vendor.getPublicFields(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving vendor',
        error: error.message,
      });
    }
  }

  static async getAllVendors(req, res) {
    try {
      const [vendors, count] = await Promise.all([
        Vendor.find({ verificationStatus: 'verified' })
          .populate('user', 'name email avatar')
          .select(
            'generalSettings storeAddress socialMedia storeHours rating reviewCount verificationStatus createdAt'
          ),
        Vendor.countDocuments({ verificationStatus: 'verified' }),
      ]);

      if (!vendors || vendors.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No verified vendors found',
        });
      }

      res.json({
        success: true,
        message: 'Vendors retrieved successfully',
        data: {
          vendors,
          total: count,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving vendors',
        error: error.message,
      });
    }
  }

  static async getTopVendors(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const sortBy = req.query.sortBy || 'rating';

      let sortCriteria;
      switch (sortBy) {
        case 'sales':
          sortCriteria = { totalRevenue: -1, rating: -1 };
          break;
        case 'recent':
          sortCriteria = { createdAt: -1, rating: -1 };
          break;
        default:
          sortCriteria = { rating: -1, reviewCount: -1 };
      }

      const topVendors = await Vendor.aggregate([
        { $match: { verificationStatus: 'verified' } },
        {
          $addFields: {
            topScore: {
              $add: [
                { $multiply: ['$rating', 0.4] },
                { $multiply: [{ $divide: ['$totalRevenue', 1000] }, 0.3] },
                { $multiply: [{ $divide: ['$reviewCount', 10] }, 0.3] },
              ],
            },
          },
        },
        { $sort: sortCriteria },
        { $limit: limit },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $project: {
            generalSettings: 1,
            rating: 1,
            reviewCount: 1,
            totalRevenue: 1,
            createdAt: 1,
            topScore: 1,
            verificationStatus: 1,
            'userDetails.name': 1,
            'userDetails.email': 1,
            'userDetails.avatar': 1,
          },
        },
      ]);

      res.json({
        success: true,
        message: `Top vendors by ${sortBy} retrieved successfully`,
        data: {
          vendors: topVendors,
          total: topVendors.length,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving top vendors',
        error: error.message,
      });
    }
  }

  // Admin-specific methods
  static async getVendorsForAdmin(req, res) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
    }

    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const filter = {};

      if (req.query.verificationStatus) {
        filter.verificationStatus = req.query.verificationStatus;
      }
      if (req.query.businessType) {
        filter.businessType = req.query.businessType;
      }
      if (req.query.search) {
        filter.$or = [
          { businessName: { $regex: req.query.search, $options: 'i' } },
          {
            'generalSettings.storeName': {
              $regex: req.query.search,
              $options: 'i',
            },
          },
        ];
      }

      const [vendors, total] = await Promise.all([
        Vendor.find(filter)
          .populate('user', 'name email avatar createdAt')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Vendor.countDocuments(filter),
      ]);

      res.json({
        success: true,
        message: 'Vendors retrieved successfully',
        data: {
          vendors,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving vendors for admin',
        error: error.message,
      });
    }
  }

  static async updateVendorVerificationStatus(req, res) {
    try {
      const { status, notes } = req.body;

      if (req.user.id && req.user.role !== 'admin') {
        return res
          .status(401)
          .json({ success: false, message: 'Only admin can verify vendor' });
      }

      const vendor = await Vendor.findByIdAndUpdate(
        req.params.id,
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
          success: false,
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
        success: true,
        message: `Vendor ${status} successfully`,
        data: vendor,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating verification status',
        error: error.message,
      });
    }
  }

  static async manageDocuments(req, res) {
    try {
      const vendor = await Vendor.findOne({ user: req.user.id });

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor profile not found',
        });
      }

      if (req.method === 'DELETE') {
        vendor.verificationDocuments.pull(req.params.documentId);
      } else {
        vendor.verificationDocuments.push(...req.body.documents);
      }

      await vendor.save();

      res.json({
        success: true,
        message: `Documents ${
          req.method === 'DELETE' ? 'deleted' : 'uploaded'
        } successfully`,
        data: vendor.verificationDocuments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error managing documents',
        error: error.message,
      });
    }
  }

  static async toggleAccountStatus(req, res) {
    try {
      let targetVendorId;

      if (req.user.role === 'admin') {
        targetVendorId = req.params.id;
        if (!targetVendorId) {
          return res.status(400).json({
            success: false,
            message: 'Vendor ID is required for admin operations',
          });
        }
      } else if (req.user.role === 'vendor') {
        const vendor = await Vendor.findOne({ user: req.user.id });
        targetVendorId = vendor?._id;
      } else {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions to perform this action',
        });
      }

      const vendor = await Vendor.findById(targetVendorId);

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor profile not found',
        });
      }

      const isDeactivating = !vendor.deactivatedAt;

      // Vendors can only deactivate their own account, not reactivate
      if (req.user.role === 'vendor' && !isDeactivating) {
        return res.status(403).json({
          success: false,
          message:
            'Only admins can reactivate vendor accounts. Please contact support.',
        });
      }

      if (isDeactivating) {
        vendor.deactivationReason = req.body.reason;
        vendor.deactivatedAt = new Date();
      } else {
        vendor.deactivationReason = undefined;
        vendor.deactivatedAt = undefined;
      }

      await vendor.save();

      res.json({
        success: true,
        message: `Vendor account ${
          isDeactivating ? 'deactivated' : 'reactivated'
        } successfully`,
        data: {
          deactivated: !!vendor.deactivatedAt,
          deactivatedAt: vendor.deactivatedAt,
          deactivationReason: vendor.deactivationReason,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error toggling account status',
        error: error.message,
      });
    }
  }

  static async getStatistics(req, res) {
    try {
      if (req.params.type === 'admin') {
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

        return res.json({
          success: true,
          data: {
            totalVendors,
            verifiedVendors,
            pendingVendors,
            rejectedVendors,
            totalRevenue:
              revenueAggregate.length > 0
                ? revenueAggregate[0].totalRevenue
                : 0,
            recentRegistrations,
          },
        });
      }

      // Vendor statistics
      const vendor = await Vendor.findOne({ user: req.user.id });
      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor profile not found',
        });
      }

      res.json({
        success: true,
        data: {
          totalOrders: vendor.totalOrders || 0,
          totalRevenue: vendor.totalRevenue || 0,
          rating: vendor.rating || 0,
          reviewCount: vendor.reviewCount || 0,
          verificationStatus: vendor.verificationStatus,
          profileCompletion: vendor.calculateProfileCompletion(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving statistics',
        error: error.message,
      });
    }
  }
}

module.exports = VendorController;
