module.exports.resSuccessObject = ({
  message = '',
  results = {},
  accessToken,
  refreshToken,
}) => {
  const response = {
    success: true,
    message,
    results,
  };

  if (accessToken) response.accessToken = accessToken;
  if (refreshToken) response.refreshToken = refreshToken;

  return response;
};
