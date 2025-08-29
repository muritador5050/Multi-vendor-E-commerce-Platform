const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const {
  categoryImageUpload,
  handleUploadError,
} = require('../utils/FileUploads');

const handleImageUpload = (req, res, next) => {
  categoryImageUpload.single('categoryImage')(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    next();
  });
};

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       '200':
 *         description: A list of categories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriesListResponse'
 */
router.get('/', asyncHandler(CategoryController.getAllCategories));

/**
 * @openapi
 * /api/categories:
 *   post:
 *     summary: Create single or multiple categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *                 example: "Electronics"
 *               categoryImage:
 *                 type: string
 *                 format: binary
 *                 description: Category image file
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/CategoryInput'
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/CategoryInput'
 *           examples:
 *             single:
 *               summary: Create single category
 *               value:
 *                 name: "Electronics"
 *                 image: "https://example.com/electronics.jpg"
 *             multiple:
 *               summary: Create multiple categories
 *               value:
 *                 - name: "Electronics"
 *                   image: "https://example.com/electronics.jpg"
 *                 - name: "Clothing"
 *                   image: "https://example.com/clothing.jpg"
 *     responses:
 *       '201':
 *         description: Category/Categories created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryResponse'
 *       '400':
 *         description: Bad request
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router.post(
  '/',
  authenticate,
  checkRole('admin', 'create'),
  handleImageUpload,
  asyncHandler(CategoryController.createCategories)
);

/**
 * @openapi
 * /api/categories/slug/{slug}:
 *   get:
 *     summary: Get category by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         schema:
 *           type: string
 *         required: true
 *         description: Category slug
 *       - in: query
 *         name: includeProducts
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include products in the category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (when includeProducts is true)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products per page
 *     responses:
 *       '200':
 *         description: A single category with optional products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryResponse'
 *       '404':
 *         description: Category not found
 */
router.get('/slug/:slug', asyncHandler(CategoryController.getCategoryBySlug));

/**
 * @openapi
 * /api/categories/{id}:
 *   get:
 *     summary: Get a single category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       '200':
 *         description: A single category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       '404':
 *         description: Category not found
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *   put:
 *     summary: Update a category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *               categoryImage:
 *                 type: string
 *                 format: binary
 *                 description: New category image file
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       '200':
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       '404':
 *         description: Category not found
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *       - in: query
 *         name: force
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Force delete even if category has products
 *     responses:
 *       '200':
 *         description: Category deleted successfully
 *       '400':
 *         description: Category has products (use force=true to delete anyway)
 *       '404':
 *         description: Category not found
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden
 */
router
  .route('/:id')
  .get(
    authenticate,
    checkRole('admin', 'read'),
    asyncHandler(CategoryController.getCategoryById)
  )
  .patch(
    authenticate,
    checkRole('admin', 'edit'),
    handleImageUpload,
    asyncHandler(CategoryController.updateCategory)
  )
  .delete(
    authenticate,
    checkRole('admin', 'delete'),
    asyncHandler(CategoryController.deleteCategory)
  );

module.exports = router;
