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

router.get('/', authenticate, asyncHandler(VendorController.getAllVendors));
router.get('/top', authenticate, asyncHandler(VendorController.getTopVendors));

router.get(
  '/profile/completion',
  authenticate,
  checkRole('vendor', 'read'),
  asyncHandler(VendorController.getProfileCompletion)
);

router.get(
  '/profile-status',
  authenticate,
  asyncHandler(VendorController.getVendorProfileStatus)
);

router.post(
  '/onboarding',
  authenticate,
  checkRole('vendor', 'create'),
  uploadVendorImages,
  asyncHandler(VendorController.updateVendorData)
);
router
  .route('/profile')
  .get(
    authenticate,
    checkRole('vendor', 'read'),
    asyncHandler(VendorController.getVendorProfile)
  )
  .patch(
    authenticate,
    checkRole('vendor', 'edit'),

    asyncHandler(VendorController.updateVendorData)
  );

// Settings management
router.patch(
  '/settings/:settingType',
  authenticate,
  checkRole('vendor', 'edit'),
  uploadVendorImages,
  asyncHandler(VendorController.updateSettings)
);

// Document management routes
router.post(
  '/documents',
  authenticate,
  checkRole('vendor', 'create'),
  vendorDocumentsUpload.array('documents', 5),
  asyncHandler(VendorController.uploadDocuments),
  handleUploadError
);

router.get(
  '/documents',
  authenticate,
  checkRole('vendor', 'read'),
  asyncHandler(VendorController.getDocuments)
);

router.delete(
  '/documents/:documentId',
  authenticate,
  checkRole('vendor', 'delete'),
  asyncHandler(VendorController.deleteDocument)
);

// Admin routes
router.get(
  '/admin/list',
  authenticate,
  checkRole('admin', 'read'),
  asyncHandler(VendorController.getVendorsForAdmin)
);

// Account status toggle
router.patch(
  '/toggle-status',
  authenticate,
  checkRole('vendor', 'edit'),
  asyncHandler(VendorController.toggleAccountStatus)
);

router.patch(
  '/toggle-status/:id',
  authenticate,
  checkRole('admin', 'edit'),
  asyncHandler(VendorController.toggleAccountStatus)
);

router.patch(
  '/admin/verify/:id',
  authenticate,
  checkRole('admin', 'edit'),
  asyncHandler(VendorController.updateVendorVerificationStatus)
);

// Statistics routes
router.get(
  '/stats/:type',
  authenticate,
  (req, res, next) => {
    const requiredRole = req.params.type === 'admin' ? 'admin' : 'vendor';
    checkRole(requiredRole, 'read')(req, res, next);
  },
  asyncHandler(VendorController.getStatistics)
);

router.get('/:id', asyncHandler(VendorController.getVendorById));

module.exports = router;
