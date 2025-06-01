module.exports = (req, res, next) => {
  req.user = {
    _id: 'mock-user-id',
    role: 'user',
  };
  next();
};
