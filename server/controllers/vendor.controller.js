const Vendor = require('../models/vendor.model');
const User = require('../models/user.model');
const EmailService = require('../services/emailService');

class VendorController {
  static async upsertVendorProfile(req, res) {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || user.role !== 'vendor') {
      return res.status(403).json({
        message: 'Only users with vendor role can create vendor profiles',
      });
    }

    const vendor = await Vendor.findOneAndUpdate(
      { userId },
      { userId, ...req.body },
      { new: true, upsert: true, runValidators: true }
    ).populate('user', '-password -refreshToken');

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
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    res.json({ success: true, data: vendor });
  }

  static async getVendor(req, res) {
    const vendor = await Vendor.findByIdentifier(req.params.identifier);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({
      success: true,
      data: vendor.getPublicFields(),
    });
  }

  static async getAllVendors(req, res) {
    const query = Vendor.buildQuery({ ...req.query, verified: true });
    const { page, limit } = Vendor.buildPagination(
      req.query.page,
      req.query.limit
    );

    const [vendors, total] = await Vendor.findWithPagination(
      query,
      page,
      limit,
      'user',
      'businessName storeName storeDescription storeLogo storeSlug rating reviewCount verificationStatus createdAt'
    );

    res.json({
      success: true,
      data: vendors,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }

  static async getVendorsForAdmin(req, res) {
    const query = Vendor.buildQuery(req.query);
    const { page, limit } = Vendor.buildPagination(
      req.query.page,
      req.query.limit
    );

    const [vendors, total] = await Vendor.findWithPagination(
      query,
      page,
      limit,
      'user'
    );

    res.json({
      success: true,
      data: vendors,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  }

  static async updateVerificationStatus(req, res) {
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
    const vendor = await Vendor.findByUserId(req.user.id);

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const isDeactivating = !vendor.deactivatedAt;
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
