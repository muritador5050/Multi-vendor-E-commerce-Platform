const joi = require('joi');

//Register
const register = joi
  .object({
    name: joi.string().min(2).max(50).required(),
    email: joi.string().email().required(),
    password: joi.string().min(5).required(),
    confirmPassword: joi.string().valid(joi.ref('password')).required(),
    role: joi.string().valid('customer', 'admin', 'vendor').default('customer'),
  })
  .required();

//Login
const login = joi
  .object({
    email: joi.string().required(),
    password: joi.string().required(),
    rememberMe: joi.boolean().optional().default(false),
  })
  .required();

const reviewInput = joi.object({
  product: joi.string().required(),
  rating: joi.number().min(1).max(5).required(),
  comment: joi.string().optional(),
});

module.exports = { register, login, reviewInput };
