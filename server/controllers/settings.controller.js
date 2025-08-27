const Settings = require('../models/settings.model');

class SettingsController {
  static async getSettings(req, res) {
    try {
      let settings = await Settings.findOne();

      if (!settings) {
        settings = await Settings.create({});
      }

      res.status(200).json({
        success: true,
        message: 'Setting created successfully',
        data: settings,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Update settings
  static async updateSettings(req, res) {
    try {
      const { platformName, adminEmail, commissionRate, currency } = req.body;

      let settings = await Settings.findOne();

      if (!settings) {
        settings = new Settings();
      }

      // update only provided fields
      if (platformName) settings.platformName = platformName;
      if (adminEmail) settings.adminEmail = adminEmail;
      if (commissionRate !== undefined)
        settings.commissionRate = commissionRate;
      if (currency) settings.currency = currency;

      await settings.save();

      res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: settings,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = SettingsController;
