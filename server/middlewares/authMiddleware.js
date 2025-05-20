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
    res.status(401).json({ message: 'Invalid token' });
  }
};

const isAdmin = asyncHandler(async function (req, res, next) {
  if (req.user.role !== 'admin') {
    res.json({ message: 'Access denied!' });
  }
  next();
});

module.exports = { authenticate, isAdmin };
