require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');

// Local modules
const { globalErrorHandler } = require('./utils/globalErrorHandler');
const { FRONTEND_URL, NODE_ENV, FRONTEND_URL_PROD } = require('./configs');
const { connectDB } = require('./database/index');
const { specs, swaggerUi } = require('./swagger');
const { generalLimiter } = require('./middlewares/rateLimiter');

require('./controllers/passport');

const app = express();

app.use('/api/payments/webhooks', (req, res, next) => {
  if (req.path.includes('stripe')) {
    return express.raw({ type: 'application/json' })(req, res, next);
  }

  if (req.path.includes('paystack')) {
    return express.json({
      verify: (req, res, buf) => {
        req.rawBody = buf;
      },
    })(req, res, next);
  }

  express.raw({ type: 'application/json' })(req, res, next);
});

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.set('trust proxy', 1);

app.use('/api/payments/webhooks', (req, res, next) => {
  console.log('⚡ Skipping rate limit for webhook:', req.path);
  next();
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/payments/webhooks')) {
    return next();
  }
  generalLimiter(req, res, next);
});

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = [FRONTEND_URL, FRONTEND_URL_PROD].filter(Boolean);

    console.log('Checking origin:', origin);
    console.log('Allowed origins:', allowedOrigins);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
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
    'stripe-signature',
    'x-paystack-signature',
  ],
  maxAge: 86400,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.path.startsWith('/api/payments/webhooks')) {
    return next();
  }

  // Skip for multipart forms
  if (req.headers['content-type']?.startsWith('multipart/form-data')) {
    return next();
  }

  // Apply JSON parsing for other routes
  express.json()(req, res, next);
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/payments/webhooks')) {
    return next();
  }

  if (req.headers['content-type']?.startsWith('multipart/form-data')) {
    return next();
  }

  express.urlencoded({ extended: true })(req, res, next);
});

// Other middleware
app.use(cookieParser());
app.use(
  morgan('combined', {
    skip: function (req, res) {
      return (
        !req.path.includes('/webhooks') &&
        process.env.NODE_ENV !== 'development'
      );
    },
  })
);

// Passport initialization
app.use(passport.initialize());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Debug middleware for webhooks
app.use('/api/payments/webhooks', (req, res, next) => {
  next();
});

// Application routes
app.use('/', require('./routes'));

if (NODE_ENV !== 'test') {
  connectDB();
}

app.use(globalErrorHandler);

module.exports = app;
