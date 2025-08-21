const User = require('../models/user.model');

const userActivityCache = new Map();
const ACTIVITY_UPDATE_INTERVAL = 30000;

const trackUserActivity = async (req, res, next) => {
  if (req.user?.id) {
    const userId = req.user.id;
    const now = Date.now();
    const lastUpdate = userActivityCache.get(userId) || 0;

    // Only update database every 30 seconds per user
    if (now - lastUpdate > ACTIVITY_UPDATE_INTERVAL) {
      userActivityCache.set(userId, now);

      setImmediate(async () => {
        try {
          await User.findByIdAndUpdate(userId, {
            lastSeen: new Date(),
            isOnline: true,
          });
        } catch (error) {
          console.warn('Activity tracking failed:', error.message);
        }
      });
    }
  }
  next();
};

module.exports = trackUserActivity;
