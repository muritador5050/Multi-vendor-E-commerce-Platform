// require('dotenv').config();

// // Third-party dependencies
// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const cookieParser = require('cookie-parser');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const passport = require('passport');

// // Local modules
// const { globalErrorHandler } = require('./utils/globalErrorHandler');
// const { FRONTEND_URL, NODE_ENV } = require('./configs');
// const { connectDB } = require('./database/index');
// const { specs, swaggerUi } = require('./swagger');
// const { generalLimiter } = require('./middlewares/rateLimiter');

// // Passport configuration
// require('./controllers/passport');

// // App initialization
// const app = express();

// // Security middleware
// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: 'cross-origin' },
//   })
// );
// app.use(generalLimiter);

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);

//     if (
//       FRONTEND_URL &&
//       (origin === FRONTEND_URL || FRONTEND_URL.includes(origin))
//     ) {
//       callback(null, true);
//     } else {
//       console.log(`CORS blocked origin: ${origin}, allowed: ${FRONTEND_URL}`);
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   optionsSuccessStatus: 200,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: [
//     'Origin',
//     'X-Requested-With',
//     'Content-Type',
//     'Accept',
//     'Authorization',
//     'Cache-Control',
//   ],
//   maxAge: 86400,
// };

// // Handle preflight request
// app.use(cors(corsOptions));

// app.use('/api/payments/webhooks', express.raw({ type: 'application/json' }));

// // Body parsing middleware
// app.use((req, res, next) => {
//   if (req.path.startsWith('/api/payments/webhooks')) {
//     return next();
//   }

//   if (req.headers['content-type']?.startsWith('multipart/form-data')) {
//     return next();
//   }
//   express.json()(req, res, next);
// });

// app.use((req, res, next) => {
//   if (req.path.startsWith('/api/payments/webhooks')) {
//     return next();
//   }

//   if (req.headers['content-type']?.startsWith('multipart/form-data')) {
//     return next();
//   }
//   express.urlencoded({ extended: true })(req, res, next);
// });

// // Other middleware
// app.use(cookieParser());
// app.use(morgan('dev'));

// // Passport initialization
// app.use(passport.initialize());

// // Static files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Swagger UI route
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// // Application routes
// app.use('/', require('./routes'));

// if (NODE_ENV !== 'test') {
//   connectDB();
// }

// app.use(globalErrorHandler);

// module.exports = app;

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
const { FRONTEND_URL, NODE_ENV } = require('./configs');
const { connectDB } = require('./database/index');
const { specs, swaggerUi } = require('./swagger');
const { generalLimiter } = require('./middlewares/rateLimiter');

require('./controllers/passport');

const app = express();

// CRITICAL FIX: Webhook-specific middleware BEFORE general body parsing
app.use('/api/payments/webhooks', (req, res, next) => {
  console.log('🔧 Webhook middleware:', req.path);
  console.log('📊 Content-Type:', req.headers['content-type']);

  // For Stripe, preserve raw body
  if (req.path.includes('stripe')) {
    console.log('🔵 Stripe webhook - preserving raw body');
    return express.raw({ type: 'application/json' })(req, res, next);
  }

  // For Paystack, can use JSON parsing
  if (req.path.includes('paystack')) {
    console.log('🟢 Paystack webhook - using JSON parsing');
    return express.json({
      verify: (req, res, buf) => {
        req.rawBody = buf;
      },
    })(req, res, next);
  }

  // Default to raw for unknown providers
  express.raw({ type: 'application/json' })(req, res, next);
});

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CRITICAL FIX: Trust proxy for ngrok
app.set('trust proxy', true);

// Skip rate limiting for webhook endpoints
app.use('/api/payments/webhooks', (req, res, next) => {
  console.log('⚡ Skipping rate limit for webhook:', req.path);
  next();
});

// Apply rate limiting to other routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/payments/webhooks')) {
    return next();
  }
  generalLimiter(req, res, next);
});

const corsOptions = {
  origin: function (origin, callback) {
    // Allow webhook calls (no origin) and configured origins
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin (likely webhook)');
      return callback(null, true);
    }

    if (
      FRONTEND_URL &&
      (origin === FRONTEND_URL || FRONTEND_URL.includes(origin))
    ) {
      console.log('✅ CORS: Allowing configured origin:', origin);
      callback(null, true);
    } else {
      console.log(
        `❌ CORS blocked origin: ${origin}, allowed: ${FRONTEND_URL}`
      );
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
    'stripe-signature', // Add Stripe signature header
    'x-paystack-signature', // Add Paystack signature header
  ],
  maxAge: 86400,
};

app.use(cors(corsOptions));

// General body parsing middleware (AFTER webhook-specific middleware)
app.use((req, res, next) => {
  // Skip body parsing for webhook routes as they have their own middleware
  if (req.path.startsWith('/api/payments/webhooks')) {
    console.log('⏭️ Skipping general body parsing for webhook');
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
    // Log all webhook requests for debugging
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
  console.log('🔍 WEBHOOK REQUEST DEBUG:');
  console.log('├── Path:', req.path);
  console.log('├── Method:', req.method);
  console.log('├── Headers:', JSON.stringify(req.headers, null, 2));
  console.log('├── Body type:', typeof req.body);
  console.log('├── Body length:', req.body?.length || 'undefined');
  console.log('└── Query:', req.query);
  next();
});

// Application routes
app.use('/', require('./routes'));

// Webhook test endpoint
app.get('/webhook-test', (req, res) => {
  res.json({
    message: 'Server is running and reachable',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

if (NODE_ENV !== 'test') {
  connectDB();
}

app.use(globalErrorHandler);

module.exports = app;
