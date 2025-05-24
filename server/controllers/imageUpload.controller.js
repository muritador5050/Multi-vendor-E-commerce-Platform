const Category = require('../models/category.model');

class UploadController {
  static async uploadImage(req, res) {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageUrl = `/upload/images/${req.file.filename}`;

    const category = await Category.findByIdAndUpdate(
      id,
      {
        image: imageUrl,
      },
      { new: true }
    );

    res.json({
      message: 'Image uploaded successfully',
      image: imageUrl,
      category,
    });
  }
}

module.exports = UploadController;
