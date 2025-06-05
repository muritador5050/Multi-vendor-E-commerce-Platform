const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  authenticate,
  isVendor,
  isAdmin,
  adminOrVendor,
} = require('../middlewares/authMiddleware');

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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/', asyncHandler(CategoryController.getAllCategories));

/**
 * @openapi
 * /api/categories/search:
 *   get:
 *     summary: Search categories by name
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term for category names
 *     responses:
 *       '200':
 *         description: A list of categories matching the search term
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
router.get('/:slug', asyncHandler(CategoryController.getCategoryBySlug));

/**
 * @openapi
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 */
router.post(
  '/',
  authenticate,
  isAdmin,
  asyncHandler(CategoryController.createCategory)
);

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Category deleted successfully
 */

/**
 * @openapi
 * /api/categories/{id}:
 *   get:
 *     summary: Get a single category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A single category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *   put:
 *     summary: Update a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       '200':
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Category deleted successfully
 */
router
  .route('/:id')
  .get(
    authenticate,
    adminOrVendor,
    asyncHandler(CategoryController.getCategoryById)
  )
  .put(
    authenticate,
    adminOrVendor,
    asyncHandler(CategoryController.updateCategory)
  )
  .delete(
    authenticate,
    isAdmin,
    asyncHandler(CategoryController.deleteCategory)
  );

module.exports = router;
