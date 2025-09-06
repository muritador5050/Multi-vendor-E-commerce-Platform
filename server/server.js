require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
});

const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');

// Local modules
const { globalErrorHandler } = require('./utils/globalErrorHandler');
const { FRONTEND_URL, NODE_ENV, BACKEND_URL, PORT } = require('./configs');
const { connectDB } = require('./database/index');
const { specs, swaggerUi } = require('./swagger');
const { generalLimiter } = require('./middlewares/rateLimiter');

require('./controllers/passport');

const app = express();

// Log environment info for debugging
console.log(`🚀 Starting server in ${NODE_ENV} mode`);
console.log(`📍 Frontend URL: ${FRONTEND_URL}`);
console.log(`📍 Backend URL: ${BACKEND_URL}`);
console.log(
  `📍 Environment file loaded: .env.${process.env.NODE_ENV || 'development'}`
);

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

    const allowedOrigins = [
      'http://localhost:5173',
      'https://multi-vendor-e-commerce-platform.vercel.app',
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
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
      return !req.path.includes('/webhooks') && NODE_ENV !== 'development';
    },
  })
);

// Passport initialization
app.use(passport.initialize());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger UI route (only in development)
if (NODE_ENV === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
    frontend_url: FRONTEND_URL,
    backend_url: BACKEND_URL,
  });
});

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

app.listen(PORT, () => {
  console.log(`App listening on the port ${PORT}`);
});
