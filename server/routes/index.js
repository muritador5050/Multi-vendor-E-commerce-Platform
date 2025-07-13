const express = require('express');
const router = express.Router();
const apicache = require('apicache');
const { authLimiter } = require('../middlewares/rateLimiter');
const cache = apicache.middleware;

//Routes
router.use(
  '/api/auth',
  // authLimiter,
  require('./user.routes')
);
router.use('/api/products', cache('10 minutes'), require('./products.routes'));
router.use('/api/categories', cache('4 hours'), require('./category.routes'));
router.use('/api/vendors', require('./vendor.routes'));
router.use('/api/reviews', require('./review.routes'));
router.use('/api/orders', require('./order.routes'));
router.use('/api/payments', require('./payment.routes'));
router.use('/api/carts', require('./cart.routes'));
router.use('/api/wishlists', require('./wishlist.routes'));
router.use('/api/blogs', require('./blog.routes'));
router.use('/api/upload', require('./imageUpload.route'));

module.exports = router;
