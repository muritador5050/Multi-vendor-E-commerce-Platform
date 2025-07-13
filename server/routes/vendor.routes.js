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
    checkRole('vendor'),
    asyncHandler(VendorController.getVendorProfile)
  )
  .post(
    authenticate,
    checkRole('vendor'),
    asyncHandler(VendorController.upsertVendorProfile)
  )
  .put(
    authenticate,
    checkRole('vendor'),
    asyncHandler(VendorController.upsertVendorProfile)
  );

// === PUBLIC VENDOR ROUTES ===
router.get('/', asyncHandler(VendorController.getAllVendors));
router.get('/:identifier', asyncHandler(VendorController.getVendor)); // Works for both ID and slug

// === DOCUMENT MANAGEMENT ===
router
  .route('/documents/:documentId?')
  .post(
    authenticate,
    checkRole('vendor'),
    asyncHandler(VendorController.manageDocuments)
  )
  .delete(
    authenticate,
    checkRole('vendor'),
    asyncHandler(VendorController.manageDocuments)
  );

// === VENDOR SETTINGS ===
router.put(
  '/settings/:settingType',
  authenticate,
  checkRole('vendor'),
  asyncHandler(VendorController.updateSettings)
);

// === ACCOUNT STATUS ===
router.put(
  '/toggle-status',
  authenticate,
  checkRole('vendor'),
  asyncHandler(VendorController.toggleAccountStatus)
);

// === STATISTICS ===
router.get(
  '/stats/:type',
  authenticate,
  (req, res, next) => {
    const requiredRole = req.params.type === 'admin' ? 'admin' : 'vendor';
    checkRole(requiredRole)(req, res, next);
  },
  asyncHandler(VendorController.getStatistics)
);

// === ADMIN ROUTES ===
router.get(
  '/admin/list',
  authenticate,
  checkRole('admin'),
  asyncHandler(VendorController.getVendorsForAdmin)
);

router.put(
  '/admin/:id/verify',
  authenticate,
  checkRole('admin'),
  asyncHandler(VendorController.updateVerificationStatus)
);

module.exports = router;
