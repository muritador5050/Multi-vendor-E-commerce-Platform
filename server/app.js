require('./controllers/passport');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const { globalErrorHandler } = require('./utils/globalErrorHandler');
const passport = require('passport');
const { FRONTEND_URL, NODE_ENV } = require('./configs');
const connectDB = require('./database/index');
require('dotenv').config();

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(passport.initialize());

//middlewares
app.use(
  cors({
    origin: FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
//Routes
app.use('/uploads', express.static('uploads'));
app.use('/', require('./routes'));

// Only connect DB here if not in test environment
if (NODE_ENV !== 'test') {
  connectDB(); // avoid logging during tests
}
// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
