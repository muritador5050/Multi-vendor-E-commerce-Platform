const User = require('../models/user.model');
const cron = require('node-cron');

class CleanupService {
  static startAllJobs() {
    this.startOnlineUsersCleanup();
  }

  static startOnlineUsersCleanup() {
    // Every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        await this.cleanupStaleOnlineUsers();
      } catch (error) {
        console.error('Online users cleanup failed:', error);
      }
    });
  }

  static async cleanupStaleOnlineUsers(minutesThreshold = 10) {
    try {
      const result = await User.cleanupStaleOnlineUsers(minutesThreshold);

      if (result.modifiedCount > 0) {
        console.log(
          `[${new Date().toISOString()}] Cleaned up ${
            result.modifiedCount
          } stale online users`
        );
      }

      return result;
    } catch (error) {
      console.error('Error cleaning up stale online users:', error);
      throw error;
    }
  }

  // Optional: Manual cleanup endpoint for testing
  static async runManualCleanup() {
    return await this.cleanupStaleOnlineUsers();
  }
}

module.exports = CleanupService;
