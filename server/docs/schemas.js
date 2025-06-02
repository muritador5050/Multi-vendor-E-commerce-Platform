/**
 * @swagger
 * components:
 *   schemas:
 *     # Base User Schema
 *     User:
 *       type: object
 *       required: [name, email]
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier
 *         name:
 *           type: string
 *           description: Full name
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [customer, admin, vendor]
 *           default: customer
 *         phone:
 *           type: string
 *         address:
 *           type: object
 *           properties:
 *             street: { type: string }
 *             city: { type: string }
 *             state: { type: string }
 *             zipCode: { type: string }
 *             country: { type: string }
 *         googleId:
 *           type: string
 *           description: OAuth Google ID
 *         facebookId:
 *           type: string
 *           description: OAuth Facebook ID
 *         avatar:
 *           type: string
 *           format: uri
 *         isEmailVerified:
 *           type: boolean
 *           default: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     # Authentication Schemas
 *     UserLogin:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *
 *     UserRegister:
 *       allOf:
 *         - $ref: '#/components/schemas/UserLogin'
 *         - type: object
 *           required: [name]
 *           properties:
 *             name:
 *               type: string
 *             password:
 *               minLength: 6
 *             phone:
 *               type: string
 *             address:
 *               $ref: '#/components/schemas/User/properties/address'
 *
 *     # Product Schemas
 *     Product:
 *       type: object
 *       required: [name, price, categoryId]
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *           minLength: 1
 *           example: "Wireless Bluetooth Headphones"
 *         description:
 *           type: string
 *         slug:
 *           type: string
 *           description: URL-friendly identifier
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0.01
 *           example: 99.99
 *         discount:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *         quantityInStock:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *         categoryId:
 *           type: string
 *         category:
 *           type: string
 *           description: Category ObjectId reference
 *         attributes:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           example: { color: "Black", brand: "TechBrand" }
 *         averageRating:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 5
 *           default: 0
 *         totalReviews:
 *           type: integer
 *           default: 0
 *         isActive:
 *           type: boolean
 *           default: true
 *         isDeleted:
 *           type: boolean
 *           default: false
 *         vendor:
 *           type: string
 *           description: Vendor ObjectId reference
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     # Product Operation Schemas
 *     ProductCreate:
 *       type: object
 *       required: [name, price, categoryId]
 *       properties:
 *         name: { $ref: '#/components/schemas/Product/properties/name' }
 *         description: { $ref: '#/components/schemas/Product/properties/description' }
 *         price: { $ref: '#/components/schemas/Product/properties/price' }
 *         discount: { $ref: '#/components/schemas/Product/properties/discount' }
 *         quantityInStock: { $ref: '#/components/schemas/Product/properties/quantityInStock' }
 *         images: { $ref: '#/components/schemas/Product/properties/images' }
 *         categoryId: { $ref: '#/components/schemas/Product/properties/categoryId' }
 *         category: { $ref: '#/components/schemas/Product/properties/category' }
 *         attributes: { $ref: '#/components/schemas/Product/properties/attributes' }
 *         isActive: { $ref: '#/components/schemas/Product/properties/isActive' }
 *
 *     ProductUpdate:
 *       type: object
 *       properties:
 *         name: { $ref: '#/components/schemas/Product/properties/name' }
 *         description: { $ref: '#/components/schemas/Product/properties/description' }
 *         price: { $ref: '#/components/schemas/Product/properties/price' }
 *         discount: { $ref: '#/components/schemas/Product/properties/discount' }
 *         quantityInStock: { $ref: '#/components/schemas/Product/properties/quantityInStock' }
 *         images: { $ref: '#/components/schemas/Product/properties/images' }
 *         attributes: { $ref: '#/components/schemas/Product/properties/attributes' }
 *         isActive: { $ref: '#/components/schemas/Product/properties/isActive' }
 *
 *     # Response Schemas
 *     ProductResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Product'
 *         - type: object
 *           properties:
 *             finalPrice:
 *               type: number
 *               format: float
 *               description: Price after discount
 *             category:
 *               $ref: '#/components/schemas/CategoryBasic'
 *             vendor:
 *               $ref: '#/components/schemas/UserBasic'
 *
 *     ProductList:
 *       type: object
 *       properties:
 *         products:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductResponse'
 *         pagination:
 *           type: object
 *           properties:
 *             page: { type: integer, example: 1 }
 *             limit: { type: integer, example: 10 }
 *             totalPages: { type: integer, example: 5 }
 *             totalProducts: { type: integer, example: 47 }
 *             hasNext: { type: boolean, example: true }
 *             hasPrev: { type: boolean, example: false }
 *
 *     # Reference Schemas
 *     CategoryBasic:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         slug: { type: string }
 *
 *     UserBasic:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         email: { type: string }
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Category unique identifier
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Category name
 *           minLength: 1
 *           maxLength: 100
 *           example: "Electronics"
 *         slug:
 *           type: string
 *           description: URL-friendly category identifier
 *           pattern: '^[a-z0-9-]+$'
 *           example: "electronics"
 *         image:
 *           type: string
 *           description: Category image URL
 *           example: "https://example.com/images/electronics.jpg"
 *         productCount:
 *           type: integer
 *           description: Number of products in this category
 *           example: 25
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Category creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 *     CategoryInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "Electronics"
 *         slug:
 *           type: string
 *           description: URL-friendly identifier (auto-generated if not provided)
 *           pattern: '^[a-z0-9-]+$'
 *           example: "electronics"
 *         image:
 *           type: string
 *           example: "https://example.com/images/electronics.jpg"
 *
 *     CategoryList:
 *       type: object
 *       properties:
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             totalPages:
 *               type: integer
 *               example: 3
 *             totalCategories:
 *               type: integer
 *               example: 25
 *             hasNext:
 *               type: boolean
 *               example: true
 *             hasPrev:
 *               type: boolean
 *               example: false
 *
 *   parameters:
 *     CategoryId:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         pattern: '^[0-9a-fA-F]{24}$'
 *       description: Category ID (MongoDB ObjectId)
 *       example: "507f1f77bcf86cd799439011"
 *
 *   responses:
 *     CategorySuccess:
 *       description: Category operation successful
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: true
 *               data:
 *                 $ref: '#/components/schemas/Category'
 *               message:
 *                 type: string
 *
 *     CategoryNotFound:
 *       description: Category not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: "Category not found"
 *
 *     ValidationError:
 *       description: Invalid input data
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: "Validation failed"
 *               details:
 *                 type: object
 *
 *     ConflictError:
 *       description: Resource conflict
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *
 *     ServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: "Internal server error"
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve a paginated list of categories with optional search and sorting
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by category name
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt, -name, -createdAt, -updatedAt]
 *           default: createdAt
 *         description: Sort field (prefix - for descending)
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CategoryList'
 *                 message:
 *                   type: string
 *                   example: "Categories retrieved successfully"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     summary: Create category
 *     description: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *         multipart/form-data:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/CategoryInput'
 *               - type: object
 *                 properties:
 *                   image:
 *                     type: string
 *                     format: binary
 *                     description: Category image file
 *     responses:
 *       201:
 *         $ref: '#/components/responses/CategorySuccess'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/CategoryId'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CategorySuccess'
 *       404:
 *         $ref: '#/components/responses/CategoryNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   put:
 *     summary: Update category
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/CategoryId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               slug:
 *                 type: string
 *                 pattern: '^[a-z0-9-]+$'
 *               image:
 *                 type: string
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CategorySuccess'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/CategoryNotFound'
 *       409:
 *         $ref: '#/components/responses/ConflictError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/CategoryId'
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 *       404:
 *         $ref: '#/components/responses/CategoryNotFound'
 *       409:
 *         description: Cannot delete category with products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Cannot delete category with associated products"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/categories/slug/{slug}:
 *   get:
 *     summary: Get category by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Category slug
 *         example: "electronics"
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CategorySuccess'
 *       404:
 *         $ref: '#/components/responses/CategoryNotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
