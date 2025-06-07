const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const connectDB = require('../database/index.js');

let mongoServer;
const setupDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('In-memory MongoDB server started');
};

const teardownDatabase = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('In-memory MongoDB server stopped');
};

module.exports = {
  setupDatabase,
  teardownDatabase,
  connectDB, // Export connectDB for use in other tests if needed
};
