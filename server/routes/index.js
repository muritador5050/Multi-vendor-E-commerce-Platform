const express = require('express');
const router = express.Router();
const cache = require('apicache').middleware;
const { authLimiter } = require('../middlewares/rateLimiter');

//Routes
router.use(
  '/api/auth',
  // authLimiter,
  require('./user.routes')
);
router.use('/api/vendors', require('./vendor.routes'));
router.use('/api/products', require('./products.routes'));
router.use('/api/categories', require('./category.routes'));
router.use('/api/reviews', require('./review.routes'));
router.use('/api/orders', require('./order.routes'));
router.use('/api/payments', require('./payment.routes'));
router.use('/api/carts', require('./cart.routes'));
router.use('/api/wishlists', require('./wishlist.routes'));
router.use('/api/blogs', require('./blog.routes'));
router.use('/api/settings', require('./settings.routes'));
router.use('/api/upload', require('./imageUpload.route'));

module.exports = router;
