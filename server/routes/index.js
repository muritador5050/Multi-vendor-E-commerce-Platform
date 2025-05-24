const express = require('express');
const router = express.Router();

router.use('/api/auth', require('./user.routes'));
router.use('/api/products', require('./products.routes'));
router.use('/api/categories', require('./category.routes'));
router.use('/api/reviews', require('./review.routes'));
router.use('/api/orders', require('./order.routes'));
router.use('/api/payments', require('./payment.routes'));
router.use('/api', require('./imageUpload.route'));
module.exports = router;
