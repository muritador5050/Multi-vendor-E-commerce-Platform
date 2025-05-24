const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../configs/index');
const { asyncHandler } = require('../utils/asyncHandler');

const authenticate = (req, res, next) => {
  const headerToken = req.headers['authorization']
    ?.replace('Bearer', '')
    .trim();
  const cookieToken = req.cookies?.jwt;
  const token = headerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decode = jwt.verify(token, JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or Expired token' });
  }
};

const isAdmin = asyncHandler(async function (req, res, next) {
  if (req.user.role !== 'admin') {
    return res
      .status(403)
      .json({ message: 'Access denied. Admin role required.' });
  }
  next();
});

const isVendor = asyncHandler(async function (req, res, next) {
  if (req.user.role !== 'vendor') {
    return res
      .status(403)
      .json({ message: 'Access denied, Vendor role required.' });
  }
  next();
});

module.exports = { authenticate, isAdmin, isVendor };
