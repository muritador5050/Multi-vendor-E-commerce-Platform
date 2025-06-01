const validation = (schema) => {
  return (req, res, next) => {
    let data = { ...req.body, ...req.query, ...req.params };

    const validationResult = schema.validate(data, { abortEarly: false });
    if (validationResult.error?.details)
      return next(
        new Error(JSON.stringify(validationResult.error.details), {
          cause: 400,
        })
      );

    return next();
  };
};

//Image validation
const validateImageUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  //Additional Validations
  const allowTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ message: 'Invalid image format' });
  }

  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ message: 'Image too large' });
  }

  next();
};

module.exports = { validation, validateImageUpload };
