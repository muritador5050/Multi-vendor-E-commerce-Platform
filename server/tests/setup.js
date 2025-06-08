// tests/setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

const setupDatabase = async () => {
  try {
    // Close any existing connections first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    // Create and start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
    console.log('In-memory MongoDB server started and connected');
  } catch (error) {
    console.error('Setup database error:', error);
    throw error;
  }
};

const teardownDatabase = async () => {
  try {
    // Close mongoose connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    // Stop the in-memory server
    if (mongoServer) {
      await mongoServer.stop();
    }

    console.log('In-memory MongoDB server stopped');
  } catch (error) {
    console.error('Teardown database error:', error);
  }
};

module.exports = {
  setupDatabase,
  teardownDatabase,
};
