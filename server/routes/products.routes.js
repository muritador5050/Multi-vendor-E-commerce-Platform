const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/product.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');
const {
  productImageUpload,
  handleUploadError,
} = require('../utils/FileUploads');

// Helper middleware for optional image uploads
const optionalImageUpload = (req, res, next) => {
  productImageUpload.array('productImage', 5)(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    next();
  });
};

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: '-createdAt'
 *         description: Sort order for products
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product name or description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID or slug
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       '200':
 *         description: A list of products with pagination
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
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       type: object
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
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
 *               - price
 *               - category
 *               - productImage
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               discount:
 *                 type: number
 *               quantityInStock:
 *                 type: number
 *               category:
 *                 type: string
 *               attributes:
 *                 type: string
 *                 description: JSON string of product attributes
 *               productImage:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 5
 *     responses:
 *       '201':
 *         description: Product created successfully
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
 *                   $ref: '#/components/schemas/Product'
 */
router
  .route('/')
  .get(asyncHandler(ProductsController.getAllProducts))
  .post(
    authenticate,
    checkRole('vendor', 'create'),
    optionalImageUpload,
    asyncHandler(ProductsController.createProduct)
  );

/**
 * @openapi
 * /api/products/my-products:
 *   get:
 *     summary: Get products created by the authenticated vendor
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: '-createdAt'
 *         description: Sort order for products
 *     responses:
 *       '200':
 *         description: A list of products created by the vendor
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
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       type: object
 *       '403':
 *         description: Access denied. Only vendors can access their products
 */
router.get(
  '/my-products',
  authenticate,
  checkRole('vendor', 'read'),
  asyncHandler(ProductsController.getVendorProducts)
);

/**
 * @openapi
 * /api/products/category/{categorySlug}:
 *   get:
 *     summary: Get products by category slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categorySlug
 *         required: true
 *         schema:
 *           type: string
 *         description: The slug of the category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: '-createdAt'
 *         description: Sort order for products
 *     responses:
 *       '200':
 *         description: A list of products in the specified category
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
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       type: object
 *       '404':
 *         description: Category not found
 */
router.get(
  '/category/:slug',
  asyncHandler(ProductsController.getProductsByCategorySlug)
);

/**
 * @openapi
 * /api/products/{id}/status:
 *   patch:
 *     summary: Toggle product status (active/inactive)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       '200':
 *         description: Product status toggled successfully
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     name:
 *                       type: string
 *       '403':
 *         description: Permission denied
 *       '404':
 *         description: Product not found
 */
router.patch(
  '/:id/status',
  authenticate,
  checkRole(['admin', 'vendor'], 'edit'),
  asyncHandler(ProductsController.toggleProductStatus)
);

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
 *         description: Product ID
 *     responses:
 *       '200':
 *         description: A single product
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
 *                   $ref: '#/components/schemas/Product'
 *       '404':
 *         description: Product not found
 *   patch:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               discount:
 *                 type: number
 *               quantityInStock:
 *                 type: number
 *               category:
 *                 type: string
 *               attributes:
 *                 type: string
 *                 description: JSON string of product attributes
 *               productImage:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 5
 *                 description: Optional new images to add
 *     responses:
 *      '200':
 *        description: Product updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                success:
 *                  type: boolean
 *                message:
 *                  type: string
 *                data:
 *                  $ref: '#/components/schemas/Product'
 *      '403':
 *        description: Permission denied
 *      '404':
 *        description: Product not found
 *   delete:
 *     summary: Delete a product by ID (soft delete)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       '200':
 *         description: Product deleted successfully
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *       '403':
 *         description: Permission denied
 *       '404':
 *         description: Product not found
 * */
router
  .route('/:id')
  .get(asyncHandler(ProductsController.getProductById))
  .patch(
    authenticate,
    checkRole(['admin', 'vendor'], 'edit'),
    optionalImageUpload,
    asyncHandler(ProductsController.updateProduct)
  )
  .delete(
    authenticate,
    checkRole(['vendor', 'admin'], 'edit'),
    asyncHandler(ProductsController.deleteProduct)
  );

module.exports = router;
