const Vendor = require('../models/vendor.model');
const User = require('../models/user.model');
const EmailService = require('../services/emailService');

class VendorController {
  static async upsertVendorProfile(req, res) {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'vendor') {
      return res.status(403).json({
        message: 'Only users with vendor role can create vendor profiles',
      });
    }

    const vendor = await Vendor.findOneAndUpdate(
      { user: req.user.id },
      { user: req.user.id, ...req.body },
      { new: true, upsert: true, runValidators: true }
    ).populate('user', '-password -refreshToken -tokenVersion -_v');

    const isNewVendor =
      !vendor.createdAt ||
      vendor.createdAt.getTime() === vendor.updatedAt.getTime();

    res.status(isNewVendor ? 201 : 200).json({
      message: `Vendor profile ${
        isNewVendor ? 'created' : 'updated'
      } successfully`,
      data: vendor,
    });
  }

  static async getVendorProfile(req, res) {
    const vendor = await Vendor.findByUserId(req.user.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    if (vendor.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Your role is not vendor',
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: vendor,
    });
  }

  static async getVendorById(req, res) {
    const vendor = await Vendor.findByIdentifier(req.params.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({
      success: true,
      data: vendor.getPublicFields(),
    });
  }

  static async getAllVendors(req, res) {
    const vendors = await Vendor.findVerifiedVendors();

    if (!vendors || vendors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No verified vendors yet!',
      });
    }

    res.json({
      success: true,
      message: 'Vendors retrieved successfully',
      data: vendors,
    });
  }

  static async getVendorsForAdmin(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = Vendor.buildSearchFilter(req.query);
    const result = await Vendor.findWithPagination(filter, { page, limit });

    if (req.user.role !== 'admin') {
      return res.status(401).json('You have no access to this page');
    }

    if (!result) {
      return res.status(404).json({ message: 'Vendors not found' });
    }

    res.json({
      success: true,
      message: 'Vendors retrieved successfully',
      data: result,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
      },
    });
  }

  static async updateVendorVerificationStatus(req, res) {
    const { status, notes } = req.body;

    const vendor = await Vendor.updateVerificationStatus(
      req.params.id,
      status,
      notes,
      req.user.id
    );

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
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
  }

  static async manageDocuments(req, res) {
    const vendor = await Vendor.findByUserId(req.user.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const action = req.method === 'DELETE' ? 'remove' : 'add';
    const data =
      req.method === 'DELETE'
        ? { documentId: req.params.documentId }
        : { documents: req.body.documents };

    if (!data.documentId && !data.documents) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    await vendor.manageDocuments(action, data);

    res.json({
      message: `Documents ${
        req.method === 'DELETE' ? 'deleted' : 'uploaded'
      } successfully`,
      data: vendor.verificationDocuments,
    });
  }

  static async toggleAccountStatus(req, res) {
    let targetUserId;

    // Determine which vendor to toggle based on user role
    if (req.user.role === 'admin') {
      // Admins can toggle any vendor using req.params.id
      targetUserId = req.params.id;
      if (!targetUserId) {
        return res.status(400).json({
          message: 'Vendor ID is required for admin operations',
        });
      }
    } else if (req.user.role === 'vendor') {
      // Vendors can only toggle their own account
      targetUserId = req.user.id;
    } else {
      return res.status(403).json({
        message: 'Insufficient permissions to perform this action',
      });
    }

    const vendor = await Vendor.findById(targetUserId);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const isDeactivating = !vendor.deactivatedAt;

    // Vendors can only deactivate their own account, not reactivate
    if (req.user.role === 'vendor' && !isDeactivating) {
      return res.status(403).json({
        message:
          'Only admins can reactivate vendor accounts. Please contact support.',
      });
    }

    await vendor.toggleStatus(req.body.reason);

    res.json({
      message: `Vendor account ${
        isDeactivating ? 'deactivated' : 'reactivated'
      } successfully`,
      data: {
        deactivated: !!vendor.deactivatedAt,
        deactivatedAt: vendor.deactivatedAt,
        deactivationReason: vendor.deactivationReason,
      },
    });
  }

  static async updateSettings(req, res) {
    const vendor = await Vendor.findByUserId(req.user.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    await vendor.updateSettings(
      req.params.settingType,
      req.body[req.params.settingType]
    );

    res.json({
      message: `${req.params.settingType} updated successfully`,
      data: vendor[req.params.settingType],
    });
  }

  static async getStatistics(req, res) {
    if (req.params.type === 'admin') {
      const stats = await Vendor.getAdminStatistics();
      return res.json({ success: true, data: stats });
    }

    const vendor = await Vendor.findByUserId(req.user.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    res.json({
      success: true,
      data: vendor.getDashboardStats(),
    });
  }
}

module.exports = VendorController;
