require('./controllers/passport');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const { globalErrorHandler } = require('./utils/globalErrorHandler');
const passport = require('passport');
const { FRONTEND_URL, NODE_ENV } = require('./configs');
const connectDB = require('./database/index');
const { specs, swaggerUi } = require('./swagger');
const { generalLimiter } = require('./middlewares/rateLimiter');

//App
const app = express();

// Middleware setup
app.use(generalLimiter);
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

//Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

//Routes
app.use('/uploads/images', express.static('uploads/images'));
app.use('/', require('./routes'));

// Only connect DB here if not in test environment
if (NODE_ENV !== 'test') {
  connectDB(); // avoid logging during tests
}
// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
