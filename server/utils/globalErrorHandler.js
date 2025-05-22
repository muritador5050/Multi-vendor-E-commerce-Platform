exports.globalErrorHandler = async (error, req, res, next) =>
  res
    .status(error.status || 500)
    .json({ success: false, error: error.message, stack: error.stack });
