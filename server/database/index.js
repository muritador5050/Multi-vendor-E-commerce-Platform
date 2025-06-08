const mongoose = require('mongoose');
const { DATABASE_URL, TEST_URL } = require('../configs/index');

const connectDB = async () => {
  try {
    // Don't connect if we're in test environment and already connected
    if (
      process.env.NODE_ENV === 'test' &&
      mongoose.connection.readyState === 1
    ) {
      console.log('Already connected to test database');
      return;
    }

    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('Database already connected');
      return;
    }

    // Close existing connection if it exists but is not connected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    const mongoURI = process.env.NODE_ENV === 'test' ? TEST_URL : DATABASE_URL;

    // Remove deprecated options
    await mongoose.connect(mongoURI);

    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    // In tests, don't exit the process
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error; // Re-throw for test handling
  }
};

const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Database disconnection error:', error);
  }
};

module.exports = { connectDB, disconnectDB };
