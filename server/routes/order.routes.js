const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 format: uuid
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               billingAddress:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               paymentMethod:
 *                 type: string
 *                 description: Payment method used for the order (e.g., Stripe, PayPal, COD)
 *               paymentStatus:
 *                 type: string
 *                 enum: [pending, completed, failed, refunded]
 *                 default: pending
 *               orderStatus:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *                 default: pending
 *     responses:
 *       '201':
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   type: string
 *                   format: uuid
 *                 message:
 *                   type: string
 *                   example: Order created successfully
 *       '400':
 *         description: Bad request, invalid input data
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, user does not have permission to create an order
 *       '500':
 *         description: Internal server error
 *
 *   get:
 *     summary: Get all orders (admin only)
 *     tags: [Orders]
 *     responses:
 *       '200':
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   order:
 *                     type: string
 *                     format: uuid
 *                   user:
 *                     type: string
 *                     format: uuid
 *                   products:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         product:
 *                           type: string
 *                           format: uuid
 *                         quantity:
 *                           type: integer
 *                           minimum: 1
 *                   shippingAddress:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       zipCode:
 *                         type: string
 *                       country:
 *                         type: string
 *                   billingAddress:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       zipCode:
 *                         type: string
 *                       country:
 *                         type: string
 *                   paymentMethod:
 *                     type: string
 *                     description: Payment method used for the order (e.g., Stripe, PayPal, COD)
 *                   paymentStatus:
 *                     type: string
 *                     enum: [pending, completed, failed, refunded]
 *                     default: pending
 *                   orderStatus:
 *                     type: string
 *                     enum: [pending, processing, shipped, delivered, cancelled]
 *                     default: pending
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, user does not have permission to view orders
 *       '500':
 *         description: Internal server error
 */
router
  .route('/')
  .post(authenticate, asyncHandler(OrderController.creatOrder))
  .get(authenticate, isAdmin, asyncHandler(OrderController.getAllOrders));

/**
 * @openapi
 * /api/orders/stats:
 *   get:
 *     summary: Get order statistics (admin only)
 *     tags: [Orders]
 *     responses:
 *       '200':
 *         description: Order statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: integer
 *                 totalRevenue:
 *                   type: number
 *                   format: float
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, user does not have permission to view order stats
 *       '500':
 *         description: Internal server error
 */
router.get(
  '/stats',
  authenticate,
  isAdmin,
  asyncHandler(OrderController.getOrderStats)
);

/**
 * @openapi
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update the status of an order (admin only)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       '200':
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order status updated successfully
 *       '400':
 *         description: Bad request, invalid input data
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, user does not have permission to update order status
 */

/**
 * @openapi
 * /api/orders/{id}/status:
 * put:
 *   summary: Update the status of an order (admin only)
 *   tags: [Orders]
 * parameters:
 *     - in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: string
 *         format: uuid
 */
router.put(
  '/:id/status',
  authenticate,
  isAdmin,
  asyncHandler(OrderController.updateOrderStatus)
);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Get an order by ID (authenticated user or admin)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   type: string
 *                   format: uuid
 *                 user:
 *                   type: string
 *                   format: uuid
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         type: string
 *                         format: uuid
 *                       quantity:
 *                         type: integer
 *                         minimum: 1
 *                 shippingAddress:
 *                   type: object
 *                   properties:
 *                     street:
 *                       type: string
 *                     city:
 *                       type: string
 *                     state:
 *                       type: string
 *                     zipCode:
 *                       type: string
 *                     country:
 *                       type: string
 *                 billingAddress:
 *                   type: object
 *                   properties:
 *                     street:
 *                       type: string
 *                     city:
 *                       type: string
 *                     state:
 *                       type: string
 *                     zipCode:
 *                       type: string
 *                     country:
 *                       type: string
 *                 paymentMethod:
 *                   type: string
 *                   description: Payment method used for the order (e.g., Stripe, PayPal, COD)
 *                 paymentStatus:
 *                   type: string
 *                   enum: [pending, completed, failed, refunded]
 *                   default: pending
 *                 orderStatus:
 *                   type: string
 *                   enum: [pending, processing, shipped, delivered, cancelled]
 *                   default: pending
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, user does not have permission to view the order
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Internal server error
 *   delete:
 *     summary: Delete an order by ID (admin only)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Order deleted successfully
 */

router
  .route('/:id')
  .get(authenticate, asyncHandler(OrderController.getOrderById))
  .delete(authenticate, isAdmin, asyncHandler(OrderController.deleteOrder));

module.exports = router;
