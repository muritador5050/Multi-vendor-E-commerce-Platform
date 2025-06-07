const mongoose = require('mongoose');
const { DATABASE_URL, TEST_URL } = require('../configs/index.js');

const connectDB = async () => {
  try {
    const dbUri = process.env.NODE_ENV === 'test' ? TEST_URL : DATABASE_URL;
    await mongoose.connect(dbUri);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit();
  }
};

module.exports = connectDB;
