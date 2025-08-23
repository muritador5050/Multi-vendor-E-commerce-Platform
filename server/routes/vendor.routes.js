const express = require('express');
const router = express.Router();
const VendorController = require('../controllers/vendor.controller');
const { authenticate } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');
const uploadVendorImages = require('../middlewares/uploadVendorImages');
const {
  vendorDocumentsUpload,
  handleUploadError,
} = require('../utils/FileUploads');
const requireEmailVerified = require('../middlewares/requireEmailVerified');

router.get(
  '/',
  authenticate,
  requireEmailVerified,
  asyncHandler(VendorController.getAllVendors)
);
router.get(
  '/top-rated',
  authenticate,
  requireEmailVerified,
  asyncHandler(VendorController.getTopVendors)
);

router.get(
  '/profile/completion',
  authenticate,
  requireEmailVerified,
  checkRole('vendor', 'read'),
  asyncHandler(VendorController.getProfileCompletion)
);

router.get(
  '/profile-status',
  authenticate,
  requireEmailVerified,
  asyncHandler(VendorController.getVendorProfileStatus)
);

router.post(
  '/onboarding',
  authenticate,
  requireEmailVerified,
  checkRole('vendor', 'create'),
  uploadVendorImages,
  asyncHandler(VendorController.updateVendorData)
);
router
  .route('/profile')
  .get(
    authenticate,
    requireEmailVerified,
    checkRole('vendor', 'read'),
    asyncHandler(VendorController.getVendorProfile)
  )
  .patch(
    authenticate,
    requireEmailVerified,
    checkRole('vendor', 'edit'),

    asyncHandler(VendorController.updateVendorData)
  );

// Settings management
router.patch(
  '/settings/:settingType',
  authenticate,
  requireEmailVerified,
  checkRole('vendor', 'edit'),
  uploadVendorImages,
  asyncHandler(VendorController.updateSettings)
);

// Document management routes
router.post(
  '/documents',
  authenticate,
  requireEmailVerified,
  checkRole('vendor', 'create'),
  vendorDocumentsUpload.array('documents', 5),
  asyncHandler(VendorController.uploadDocuments),
  handleUploadError
);

router.get(
  '/documents',
  authenticate,
  requireEmailVerified,
  checkRole('vendor', 'read'),
  asyncHandler(VendorController.getDocuments)
);

router.delete(
  '/documents/:documentId',
  authenticate,
  requireEmailVerified,
  checkRole('vendor', 'delete'),
  asyncHandler(VendorController.deleteDocument)
);

// Admin routes
router.get(
  '/admin/list',
  authenticate,
  requireEmailVerified,
  checkRole('admin', 'read'),
  asyncHandler(VendorController.getVendorsForAdmin)
);

// Account status toggle
router.patch(
  '/toggle-status',
  authenticate,
  requireEmailVerified,
  checkRole('vendor', 'edit'),
  asyncHandler(VendorController.toggleAccountStatus)
);

router.patch(
  '/toggle-status/:id',
  authenticate,
  requireEmailVerified,
  checkRole('admin', 'edit'),
  asyncHandler(VendorController.toggleAccountStatus)
);

router.patch(
  '/admin/verify/:id',
  authenticate,
  requireEmailVerified,
  checkRole('admin', 'edit'),
  asyncHandler(VendorController.updateVendorVerificationStatus)
);

// Statistics routes
router.get(
  '/stats/:type',
  authenticate,
  requireEmailVerified,
  (req, res, next) => {
    const requiredRole = req.params.type === 'admin' ? 'admin' : 'vendor';
    checkRole(requiredRole, 'read')(req, res, next);
  },
  asyncHandler(VendorController.getStatistics)
);

router.get('/:id', asyncHandler(VendorController.getVendorById));

module.exports = router;
