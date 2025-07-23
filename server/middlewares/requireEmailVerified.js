const requireEmailVerified = (req, res, next) => {
  if (!req.user?.isEmailVerified) {
    return res.status(403).json({
      message: 'Access denied. Please verify your email first.',
    });
  }
  next();
};

module.exports = requireEmailVerified;
