exports.validation = (schema) => {
  return (req, res, next) => {
    let data = { ...req.body, ...req.query, ...req.params };

    const validationResult = schema.validate(data, { abortEarly: false });
    if (validationResult.error?.details)
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map((detail) => detail.message),
      });
    next();
  };
};
