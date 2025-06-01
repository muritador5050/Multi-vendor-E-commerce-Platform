const Category = require('../models/category.model');
const Product = require('../models/product.model');

// Model mapping for easy extension
const MODEL_MAP = {
  categories: { model: Category, name: 'category' },
  products: { model: Product, name: 'product' },
};

class UploadController {
  //Upload image
  static async uploadImage(req, res) {
    try {
      const { id, type } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      // Validate type
      const modelConfig = MODEL_MAP[type];
      if (!modelConfig) {
        return res.status(400).json({
          message: `Invalid type. Supported types: ${Object.keys(
            MODEL_MAP
          ).join(', ')}`,
        });
      }

      const imageUrl = `/uploads/images/${req.file.filename}`;

      // Check if entity exists first
      const existingEntity = await modelConfig.model.findById(id);
      if (!existingEntity) {
        return res.status(404).json({
          message: `${
            modelConfig.name.charAt(0).toUpperCase() + modelConfig.name.slice(1)
          } not found`,
        });
      }

      const fieldKey = modelConfig.name === 'product' ? 'images' : 'image';
      // Update the entity
      const updatedEntity = await modelConfig.model.findByIdAndUpdate(
        id,
        { [fieldKey]: imageUrl },
        { new: true }
      );

      // Dynamic response
      const response = {
        message: `${
          modelConfig.name.charAt(0).toUpperCase() + modelConfig.name.slice(1)
        } image uploaded successfully`,
        [fieldKey]: imageUrl,
      };
      response[modelConfig.name] = updatedEntity;

      res.json(response);
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        message: 'Error uploading image',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error',
      });
    }
  }

  // Upload multiple images (for products only)
  static async uploadMultipleImages(req, res) {
    try {
      const { id, type } = req.params;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No image files provided' });
      }

      const modelConfig = MODEL_MAP[type];
      if (!modelConfig) {
        return res.status(400).json({
          message: `Invalid type. Supported types: ${Object.keys(
            MODEL_MAP
          ).join(', ')}`,
        });
      }

      const existingEntity = await modelConfig.model.findById(id);
      if (!existingEntity) {
        return res.status(404).json({
          message: `${
            modelConfig.name.charAt(0).toUpperCase() + modelConfig.name.slice(1)
          } not found`,
        });
      }

      const imageUrls = req.files.map(
        (file) => `/uploads/images/${file.filename}`
      );
      const fieldKey = modelConfig.name === 'product' ? 'images' : 'image';

      // Only allow multiple uploads for products
      const updateData =
        fieldKey === 'images'
          ? { $push: { [fieldKey]: { $each: imageUrls } } }
          : { [fieldKey]: imageUrls[0] };

      const updatedEntity = await modelConfig.model.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
        }
      );

      res.json({
        message: `${
          modelConfig.name.charAt(0).toUpperCase() + modelConfig.name.slice(1)
        } image(s) uploaded successfully`,
        images: imageUrls,
        [modelConfig.name]: updatedEntity,
      });
    } catch (error) {
      console.error('Upload multiple images error:', error);
      res.status(500).json({
        message: 'Error uploading images',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error',
      });
    }
  }

  // Delete image
  static async deleteImage(req, res) {
    try {
      const { id, type } = req.params;

      const modelConfig = MODEL_MAP[type];
      if (!modelConfig) {
        return res.status(400).json({
          message: `Invalid type. Supported types: ${Object.keys(
            MODEL_MAP
          ).join(', ')}`,
        });
      }

      const fieldKey = modelConfig.name === 'product' ? 'images' : 'image';

      const updatedEntity = await modelConfig.model.findByIdAndUpdate(
        id,
        { $unset: { [fieldKey]: 1 } },
        { new: true }
      );

      if (!updatedEntity) {
        return res.status(404).json({
          message: `${
            modelConfig.name.charAt(0).toUpperCase() + modelConfig.name.slice(1)
          } not found`,
        });
      }

      res.json({
        message: `${
          modelConfig.name.charAt(0).toUpperCase() + modelConfig.name.slice(1)
        } image deleted successfully`,
        [modelConfig.name]: updatedEntity,
      });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({
        message: 'Error deleting image',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error',
      });
    }
  }

  // Bonus: Replace image method
  static async replaceImage(req, res) {
    try {
      const { id, type } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const modelConfig = MODEL_MAP[type];
      if (!modelConfig) {
        return res.status(400).json({
          message: `Invalid type. Supported types: ${Object.keys(
            MODEL_MAP
          ).join(', ')}`,
        });
      }

      const existingEntity = await modelConfig.model.findById(id);
      if (!existingEntity) {
        return res.status(404).json({
          message: `${
            modelConfig.name.charAt(0).toUpperCase() + modelConfig.name.slice(1)
          } not found`,
        });
      }

      const imageUrl = `/uploads/images/${req.file.filename}`;
      const fieldKey = modelConfig.name === 'product' ? 'images' : 'image';
      const updatedEntity = await modelConfig.model.findByIdAndUpdate(
        id,
        { [fieldKey]: imageUrl },
        { new: true }
      );

      res.json({
        message: `${
          modelConfig.name.charAt(0).toUpperCase() + modelConfig.name.slice(1)
        } image replaced successfully`,
        [fieldKey]: imageUrl,
        [modelConfig.name]: updatedEntity,
      });
    } catch (error) {
      console.error('Replace image error:', error);
      res.status(500).json({
        message: 'Error replacing image',
        error:
          process.env.NODE_ENV === 'development'
            ? error.message
            : 'Internal server error',
      });
    }
  }
}

module.exports = UploadController;
