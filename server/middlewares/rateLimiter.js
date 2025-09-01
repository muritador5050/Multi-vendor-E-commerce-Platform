const rateLimit = require('express-rate-limit');

//Generic limiter
const generalLimiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 3 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Try again in 2 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
};
