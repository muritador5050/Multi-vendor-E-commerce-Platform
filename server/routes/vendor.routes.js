const express = require('express');
const router = express.Router();
const VendorController = require('../controllers/vendor.controller');
const { authenticate } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');

// === VENDOR PROFILE ROUTES ===
router
  .route('/profile')
  .get(
    authenticate,
    checkRole(['vendor'], 'read'),
    asyncHandler(VendorController.getVendorProfile)
  )
  .post(
    authenticate,
    checkRole('vendor', 'create'),
    asyncHandler(VendorController.upsertVendorProfile)
  )
  .put(
    authenticate,
    checkRole('vendor', 'edit'),
    asyncHandler(VendorController.upsertVendorProfile)
  );

// === PUBLIC VENDOR ROUTES ===
router.get('/', asyncHandler(VendorController.getAllVendors));
router.get('/:identifier', asyncHandler(VendorController.getVendor));

// === DOCUMENT MANAGEMENT ===
router
  .route('/documents/:documentId')
  .post(
    authenticate,
    checkRole('vendor', 'create'),
    asyncHandler(VendorController.manageDocuments)
  )
  .delete(
    authenticate,
    checkRole('vendor', 'delete'),
    asyncHandler(VendorController.manageDocuments)
  );

// === VENDOR SETTINGS ===
router.put(
  '/settings/:settingType',
  authenticate,
  checkRole('vendor', 'edit'),
  asyncHandler(VendorController.updateSettings)
);

// === ACCOUNT STATUS ===
router.put(
  '/toggle-status',
  authenticate,
  checkRole('vendor', 'edit'),
  asyncHandler(VendorController.toggleAccountStatus)
);

// === STATISTICS ===
router.get(
  '/stats/:type',
  authenticate,
  (req, res, next) => {
    const requiredRole = req.params.type === 'admin' ? 'admin' : 'vendor';
    checkRole(requiredRole, 'read')(req, res, next);
  },
  asyncHandler(VendorController.getStatistics)
);

// === ADMIN ROUTES ===
router.get(
  '/admin/list',
  authenticate,
  checkRole('admin', 'read'),
  asyncHandler(VendorController.getVendorsForAdmin)
);

router.put(
  '/admin/:id/verify',
  authenticate,
  checkRole('admin', 'edit'),
  asyncHandler(VendorController.updateVerificationStatus)
);

module.exports = router;
