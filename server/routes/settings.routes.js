const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settings.controller');
const { authenticate } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');

router.get('/', asyncHandler(SettingsController.getSettings));

router.patch(
  '/',
  authenticate,
  checkRole('admin', 'edit'),
  asyncHandler(SettingsController.updateSettings)
);

module.exports = router;
