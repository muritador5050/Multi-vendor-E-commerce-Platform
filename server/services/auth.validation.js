const joi = require('joi');

//Register
exports.register = joi
  .object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    rePassword: joi.string().valid(joi.ref('password')).required(),
    role: joi.string().valid('customer', 'admin', 'vendor').default('customer'),
  })
  .required();

//Login
exports.login = joi
  .object({
    email: joi.string().required(),
    password: joi.string().required(),
  })
  .required();

exports.reviewInput = joi.object({
  product: joi.string().required(),
  rating: joi.number().min(1).max(5).required(),
  comment: joi.string().optional(),
});
