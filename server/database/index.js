const mongoose = require('mongoose');
const { DATABASE_URL } = require('../configs/index.js');

const connectDB = async () => {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit();
  }
};

module.exports = connectDB;
