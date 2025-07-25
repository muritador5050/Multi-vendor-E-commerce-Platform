require('dotenv').config();

// Third-party dependencies
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');

// Local modules
const { globalErrorHandler } = require('./utils/globalErrorHandler');
const { FRONTEND_URL, NODE_ENV } = require('./configs');
const { connectDB } = require('./database/index');
const { specs, swaggerUi } = require('./swagger');
const { generalLimiter } = require('./middlewares/rateLimiter');

// Passport configuration
require('./controllers/passport');

// App initialization
const app = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(generalLimiter);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if FRONTEND_URL is defined and matches the origin
    if (
      FRONTEND_URL &&
      (origin === FRONTEND_URL || FRONTEND_URL.includes(origin))
    ) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}, allowed: ${FRONTEND_URL}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
  ],
  maxAge: 86400,
};

// Handle preflight request
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Other middleware
app.use(cookieParser());
app.use(morgan('dev'));

// Passport initialization
app.use(passport.initialize());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Application routes
app.use('/', require('./routes'));

if (NODE_ENV !== 'test') {
  connectDB();
}

app.use(globalErrorHandler);

module.exports = app;
