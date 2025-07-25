const express = require('express');
const router = express.Router();
const VendorController = require('../controllers/vendor.controller');
const { authenticate } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');

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

router.get('/', asyncHandler(VendorController.getAllVendors));
router
  .route('/documents')
  .post(
    authenticate,
    checkRole('vendor', 'create'),
    asyncHandler(VendorController.manageDocuments)
  );
router.get(
  '/admin/list',
  authenticate,
  checkRole('admin', 'read'),
  asyncHandler(VendorController.getVendorsForAdmin)
);

router.put(
  '/toggle-status',
  authenticate,
  checkRole('vendor', 'edit'),
  asyncHandler(VendorController.toggleAccountStatus)
);

router.get(
  '/stats/:type',
  authenticate,
  (req, res, next) => {
    const requiredRole = req.params.type === 'admin' ? 'admin' : 'vendor';
    checkRole(requiredRole, 'read')(req, res, next);
  },
  asyncHandler(VendorController.getStatistics)
);

router.get('/:identifier', asyncHandler(VendorController.getVendor));

router.delete(
  '/documents/:documentId',
  authenticate,
  checkRole('vendor', 'delete'),
  asyncHandler(VendorController.manageDocuments)
);

router.put(
  '/settings/:settingType',
  authenticate,
  checkRole('vendor', 'edit'),
  asyncHandler(VendorController.updateSettings)
);

router.put(
  '/admin/verify/:id',
  authenticate,
  checkRole('admin', 'edit'),
  asyncHandler(VendorController.updateVerificationStatus)
);

module.exports = router;
