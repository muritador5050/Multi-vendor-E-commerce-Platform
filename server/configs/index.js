require('dotenv').config();

module.exports = {
  PORT: process.env.PORT,
  BACKEND_URL: process.env.BACKEND_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  REFRESH_TOKEN: process.env.REFRESH_TOKEN,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL,
  FRONTEND_URL_PROD: process.env.FRONTEND_URL_PROD,
  TEST_URL: process.env.TEST_URL || 'mongodb://localhost:27017/test',
};
