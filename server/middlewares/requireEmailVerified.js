const requireEmailVerified = (req, res, next) => {
  if (!req.user?.isEmailVerified) {
    return res.status(403).json({
      message:
        'Please verify your email address to continue. Check your inbox for a verification link, or visit your profile to resend it.',
    });
  }
  next();
};

module.exports = requireEmailVerified;
