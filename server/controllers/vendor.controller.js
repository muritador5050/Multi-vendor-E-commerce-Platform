const mongoose = require('mongoose');
const Vendor = require('../models/vendor.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const EmailService = require('../services/emailService');
const path = require('path');
const { BACKEND_URL } = require('../configs/index');
const { deleteFile, uploadConfigs } = require('../utils/FileUploads');

//Controller
class VendorController {
  static async updateVendorData(req, res) {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'vendor') {
      return res.status(403).json({
        message: 'Only users with vendor role can create or update vendor data',
      });
    }

    try {
      let vendor = await Vendor.findOne({ user: req.user.id });

      if (!vendor) {
        vendor = new Vendor({ user: req.user.id, ...req.body });
        await vendor.save();

        return res.status(201).json({
          success: true,
          hasVendorProfile: true,
          message: 'Vendor profile created successfully',
          data: {
            ...vendor.toObject(),
            profileCompletion: vendor.calculateProfileCompletion(),
          },
          redirectTo: '/store-manager',
        });
      }

      // Update existing vendor
      Object.assign(vendor, req.body);
      await vendor.save();

      res.status(200).json({
        success: true,
        hasVendorProfile: true,
        message: 'Vendor profile updated successfully',
        data: {
          ...vendor.toObject(),
          profileCompletion: vendor.calculateProfileCompletion(),
        },
        redirectTo: '/store-manager',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error updating vendor data',
        error: error.message,
      });
    }
  }

  static async getVendorProfileStatus(req, res) {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'vendor') {
      return res.status(403).json({
        message: 'Only users with vendor role can access vendor data',
      });
    }

    try {
      const vendor = await Vendor.findOne({ user: req.user.id });
      const hasVendorProfile = vendor !== null;

      res.status(200).json({
        success: true,
        hasVendorProfile,
        data: vendor
          ? {
              ...vendor.toObject(),
              profileCompletion: vendor.calculateProfileCompletion(),
            }
          : null,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error fetching vendor profile status',
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
          message: 'Vendor profile not found or Yet to create a one.',
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
      // Extract query parameters
      const {
        verificationStatus,
        businessType,
        minRating,
        city,
        state,
        country,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      // Build query object
      const query = {};

      if (verificationStatus) {
        query.verificationStatus = verificationStatus;
      }

      if (businessType) {
        query.businessType = businessType;
      }

      if (minRating) {
        query.rating = { $gte: parseFloat(minRating) };
      }

      if (city) {
        query['storeAddress.city'] = new RegExp(city, 'i');
      }

      if (state) {
        query['storeAddress.state'] = new RegExp(state, 'i');
      }

      if (country) {
        query['storeAddress.country'] = new RegExp(country, 'i');
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [vendors, count] = await Promise.all([
        Vendor.find(query)
          .populate('user', 'name email avatar')
          // .select(
          //   'businessRegistrationNumber businessName businessType generalSettings storeAddress socialMedia storeHours rating reviewCount verificationStatus totalOrders commission createdAt'
          // )
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Vendor.countDocuments(query),
      ]);

      if (!vendors || vendors.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No vendors found matching the criteria',
        });
      }

      res.json({
        success: true,
        message: 'Vendors retrieved successfully',
        data: {
          vendors,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit)),
            hasNextPage: parseInt(page) < Math.ceil(count / parseInt(limit)),
            hasPrevPage: parseInt(page) > 1,
          },
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
        { $match: { verificationStatus: 'approved' } },
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
            businessName: 1,
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
    const session = await mongoose.startSession();

    try {
      const { status, comment } = req.body;
      const validStatuses = ['approved', 'rejected', 'suspended', 'pending'];

      // Validate status
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid status. Must be one of: approved, rejected, suspended, pending',
        });
      }

      // Authorization check
      if (req.user.id && req.user.role !== 'admin') {
        return res
          .status(401)
          .json({ success: false, message: 'Only admin can verify vendor' });
      }

      // Prepare update data
      const updateData = {
        verificationStatus: status,
        verificationNotes: comment,
        verifiedAt: null,
        verifiedBy: req.user.id,
      };

      if (status === 'approved') {
        updateData.verifiedAt = new Date();
      }

      const result = await session.withTransaction(async () => {
        const vendor = await Vendor.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            session,
          }
        ).populate('user', 'name email');

        if (!vendor) {
          throw new Error('Vendor not found');
        }

        if (status !== 'approved') {
          await Product.updateMany(
            { vendor: vendor._id },
            { isActive: false },
            { session }
          );
        } else {
          await Product.updateMany(
            { vendor: vendor._id },
            { isActive: true },
            { session }
          );
        }

        return vendor;
      });

      try {
        switch (status) {
          case 'approved':
            await EmailService.sendVendorVerificationEmail(
              result.user,
              'approved',
              comment
            );
            break;
          case 'rejected':
            await EmailService.sendVendorVerificationEmail(
              result.user,
              'rejected',
              comment
            );
            break;
          case 'suspended':
            await EmailService.sendVendorVerificationEmail(
              result.user,
              'suspended',
              comment
            );
            break;
          case 'pending':
            await EmailService.sendVendorVerificationEmail(
              result.user,
              'pending',
              comment
            );
            break;
        }
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
      }

      res.json({
        success: true,
        message: `Vendor status updated to ${status} successfully`,
        data: {
          verificationStatus: result.verificationStatus,
          verifiedAt: result.verifiedAt,
          verifiedBy: result.verifiedBy,
        },
      });
    } catch (error) {
      console.error('Error updating vendor status:', error);

      // Handle specific error cases
      if (error.message === 'Vendor not found') {
        return res.status(404).json({
          success: false,
          message: 'Vendor not found',
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error updating verification status',
        error: error.message,
      });
    } finally {
      await session.endSession();
    }
  }

  static async uploadDocuments(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No documents uploaded',
        });
      }

      const vendor = await Vendor.findOne({ user: req.user.id });
      if (!vendor) {
        // Cleanup uploaded files if vendor not found
        await Promise.all(
          req.files.map((file) =>
            deleteFile(path.join(uploadConfigs.documents.path, file.filename))
          )
        );
        return res.status(404).json({
          success: false,
          message: 'Vendor profile not found',
        });
      }

      // Process each uploaded file
      const savedDocuments = req.files.map((file) => {
        const docUrl = `${BACKEND_URL}/uploads/vendor/documents/${file.filename}`;

        return {
          type: req.body.type || 'other',
          filename: file.filename,
          url: docUrl,
          uploadedAt: new Date(),
        };
      });

      vendor.verificationDocuments.push(...savedDocuments);
      await vendor.save();

      // Return response matching schema
      return res.status(200).json({
        success: true,
        message: 'Documents uploaded successfully',
        data: savedDocuments,
      });
    } catch (error) {
      if (req.files?.length) {
        await Promise.all(
          req.files.map((file) =>
            deleteFile(path.join(uploadConfigs.documents.path, file.filename))
          )
        );
      }
      res.status(500).json({
        success: false,
        message: 'Error uploading documents',
        error: error.message,
      });
    }
  }

  // Delete document
  static async deleteDocument(req, res) {
    try {
      const vendor = await Vendor.findOne({ user: req.user.id });
      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor profile not found',
        });
      }

      const document = vendor.verificationDocuments.id(req.params.documentId);
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found',
        });
      }

      // Delete the physical file
      await deleteFile(document.path);

      // Remove from array
      vendor.verificationDocuments.pull(req.params.documentId);
      await vendor.save();

      res.json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting document',
        error: error.message,
      });
    }
  }

  // Get documents
  static async getDocuments(req, res) {
    try {
      const vendor = await Vendor.findOne({ user: req.user.id });
      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor profile not found',
        });
      }

      res.json({
        success: true,
        data: vendor.verificationDocuments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching documents',
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
          suspendedVendors,
          rejectedVendors,
          revenueAggregate,
        ] = await Promise.all([
          Vendor.countDocuments(),
          Vendor.countDocuments({ verificationStatus: 'approved' }),
          Vendor.countDocuments({ verificationStatus: 'pending' }),
          Vendor.countDocuments({ verificationStatus: 'suspended' }),
          Vendor.countDocuments({ verificationStatus: 'rejected' }),
          Vendor.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: '$totalRevenue' } } },
          ]),
        ]);

        return res.json({
          message: 'Vendor statistics retrieved successfully',
          success: true,
          data: {
            totalVendors,
            verifiedVendors,
            pendingVendors,
            suspendedVendors,
            rejectedVendors,
            totalRevenue:
              revenueAggregate.length > 0
                ? revenueAggregate[0].totalRevenue
                : 0,
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
