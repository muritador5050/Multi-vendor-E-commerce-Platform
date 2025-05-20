module.exports.resSuccessObject = ({ message = '', results = {} }) => ({
  success: true,
  message,
  results,
});
