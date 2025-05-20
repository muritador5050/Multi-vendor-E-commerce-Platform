const express = require('express');
const router = express.Router();

router.use('/', require('./user.routes'));
router.use('/', require('./products.routes'));
router.use('/', require('./category.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/orders', require('./order.routes'));
router.use('/payments', require('./payment.routes'));

module.exports = router;
