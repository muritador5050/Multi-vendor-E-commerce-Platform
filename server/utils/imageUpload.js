const multer = require('multer');
const path = require('path');

//configere storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploade/images/');
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limit: { fileSize: 5 * 1024 * 1024 }, //5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  },
});

module.exports = { upload };
