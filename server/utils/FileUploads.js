const multer = require('multer');
const path = require('path');
const fs = require('fs');

//UploadConfig
const uploadConfigs = {
  avatar: {
    path: 'uploads/avatars/',
    fileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: /jpeg|jpg|png|gif|webp/,
    filenamePrefix: (req) => req.user?.id || 'user',
  },
  storeLogo: {
    path: 'uploads/storeLogo/',
    fileSize: 15 * 1024 * 1024,
    allowedTypes: /jpeg|jpg|png|gif|webp/,
    filenamePrefix: (req) => req.user?.id || 'storeLogo',
  },
  storeBanner: {
    path: 'uploads/storeBanner/',
    fileSize: 15 * 1024 * 1024,
    allowedTypes: /jpeg|jpg|png|gif|webp/,
    filenamePrefix: (req) => req.user?.id || 'storeBanner',
  },
  categoryImage: {
    path: 'uploads/categories/',
    fileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: /jpeg|jpg|png|gif|webp/,
    filenamePrefix: (req) => req.body?.categoryId || 'category',
  },
  productImage: {
    path: 'uploads/products/',
    fileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: /jpeg|jpg|png|gif|webp/,
    filenamePrefix: (req) => req.body?.productId || 'product',
  },
  blogImage: {
    path: 'uploads/blogs/',
    fileSize: 15 * 1024 * 1024, // 15MB
    allowedTypes: /jpeg|jpg|png|gif|webp/,
    filenamePrefix: (req) => req.body?.blogId || 'blog',
  },
};

// Create reusable upload function
const createUploadHandler = (uploadType) => {
  const config = uploadConfigs[uploadType];

  if (!config) {
    throw new Error(`Invalid upload type: ${uploadType}`);
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = config.path;
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const prefix = config.filenamePrefix(req);
      const uniqueName = `${prefix}_${Date.now()}${path.extname(
        file.originalname
      )}`;
      cb(null, uniqueName);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = config.allowedTypes;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error(`Only image files are allowed for ${uploadType}!`), false);
    }
  };

  return multer({
    storage: storage,
    limits: { fileSize: config.fileSize },
    fileFilter: fileFilter,
  });
};

/** ====VENDOR UPLOAD DATA==== */
const vendorImagesUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadPath;
      if (file.fieldname === 'storeLogo') {
        uploadPath = uploadConfigs.storeLogo.path;
      } else if (file.fieldname === 'storeBanner') {
        uploadPath = uploadConfigs.storeBanner.path;
      } else {
        return cb(new Error('Invalid field name'), false);
      }

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      let config, prefix;

      // Get config based on field name
      if (file.fieldname === 'storeLogo') {
        config = uploadConfigs.storeLogo;
        prefix = config.filenamePrefix(req);
      } else if (file.fieldname === 'storeBanner') {
        config = uploadConfigs.storeBanner;
        prefix = config.filenamePrefix(req);
      }

      const uniqueName = `${prefix}_${Date.now()}${path.extname(
        file.originalname
      )}`;
      cb(null, uniqueName);
    },
  }),
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    let config;

    // Get config based on field name
    if (file.fieldname === 'storeLogo') {
      config = uploadConfigs.storeLogo;
    } else if (file.fieldname === 'storeBanner') {
      config = uploadConfigs.storeBanner;
    } else {
      return cb(new Error('Invalid field name'), false);
    }

    const allowedTypes = config.allowedTypes;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(
        new Error(`Only image files are allowed for ${file.fieldname}!`),
        false
      );
    }
  },
});

// Create upload handlers
const avatarUpload = createUploadHandler('avatar');
const categoryImageUpload = createUploadHandler('categoryImage');
const productImageUpload = createUploadHandler('productImage');
const blogImageUpload = createUploadHandler('blogImage');
const storeLogoUpload = createUploadHandler('storeLogo');
const storeBannerUpload = createUploadHandler('storeBanner');

// Helper function to delete file
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath || !fs.existsSync(filePath)) {
      return resolve({ success: false, message: 'File not found' });
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        reject({ success: false, message: 'Error deleting file', error: err });
      } else {
        resolve({ success: true, message: 'File deleted successfully' });
      }
    });
  });
};

// Upload response helper
const uploadResponse = (res, file, uploadType) => {
  if (!file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  return res.status(200).json({
    success: true,
    message: `${uploadType} uploaded successfully`,
    data: {
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
    },
  });
};

// Error handler for uploads
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large',
      });
    }
  }

  return res.status(400).json({
    success: false,
    message: err.message || 'Upload failed',
  });
};

// Basic delete functions for specific types
const deleteAvatar = async (filePath) => {
  return await deleteFile(filePath);
};

const deleteCategoryImage = async (filePath) => {
  return await deleteFile(filePath);
};

const deleteProductImage = async (filePath) => {
  return await deleteFile(filePath);
};

const deleteBlogImage = async (filePath) => {
  return await deleteFile(filePath);
};

const deleteFileByType = async (filename, type) => {
  const config = uploadConfigs[type];
  if (!config) {
    throw new Error(`Invalid upload type: ${type}`);
  }

  const filePath = path.join(config.path, filename);
  return await deleteFile(filePath);
};

module.exports = {
  // Upload handlers
  avatarUpload,
  categoryImageUpload,
  productImageUpload,
  blogImageUpload,
  storeBannerUpload,
  storeLogoUpload,
  vendorImagesUpload,
  // Delete functions
  deleteFile,
  deleteAvatar,
  deleteCategoryImage,
  deleteProductImage,
  deleteBlogImage,
  deleteFileByType,

  // Utilities
  createUploadHandler,
  uploadConfigs,
  uploadResponse,
  handleUploadError,
};
