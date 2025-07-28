module.exports.resSuccessObject = ({
  message = '',
  data = {},
  accessToken,
  refreshToken,
}) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (accessToken) response.accessToken = accessToken;
  if (refreshToken) response.refreshToken = refreshToken;

  return response;
};

// utils/sendResponse.js
const sendResponse = (
  res,
  statusCode,
  success,
  data,
  message = '',
  errors = []
) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    errors,
  });
};
