const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/product.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const {
  authenticate,
  adminOrVendor,
  isVendor,
} = require('../middlewares/authMiddleware');

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       '200':
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       '201':
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router
  .route('/')
  .get(asyncHandler(ProductsController.getAllProducts)) // Public: Get all products
  .post(authenticate, isVendor, asyncHandler(ProductsController.createProduct)); // Vendor only: Create product

/**
 * @openapi
 * /api/products/my-products:
 *   get:
 *     summary: Get products created by the authenticated vendor
 *     tags: [Products]
 *     responses:
 *       '200':
 *         description: A list of products created by the vendor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router
  .route('/my-products')
  .get(
    authenticate,
    isVendor,
    asyncHandler(ProductsController.getVendorProducts)
  ); // Vendor only: Get own products

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A single product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *      '200':
 *        description: Product updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Product'
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product deleted successfully"
 * */
router
  .route('/:id')
  .get(asyncHandler(ProductsController.getProductById)) // Public: Get single product
  .put(
    authenticate,
    adminOrVendor,
    asyncHandler(ProductsController.updateProduct)
  ) // Admin or Vendor: Update product
  .delete(
    authenticate,
    adminOrVendor,
    asyncHandler(ProductsController.deleteProduct)
  ); // Admin or Vendor: Delete product

module.exports = router;
