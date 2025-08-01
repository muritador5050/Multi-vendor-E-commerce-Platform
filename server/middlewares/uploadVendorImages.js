const {
  vendorImagesUpload,
  handleUploadError,
} = require('../utils/FileUploads');

const uploadVendorImages = (req, res, next) => {
  const { settingType } = req.params;

  if (settingType === 'generalSettings') {
    const upload = vendorImagesUpload.fields([
      { name: 'storeLogo', maxCount: 1 },
      { name: 'storeBanner', maxCount: 1 },
    ]);

    upload(req, res, (err) => {
      if (err) return handleUploadError(err, req, res, next);
      next();
    });
  } else {
    next();
  }
};

module.exports = uploadVendorImages;
