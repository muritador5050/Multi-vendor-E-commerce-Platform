const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/order.controller');
const { asyncHandler } = require('../utils/asyncHandler');
const { authenticate } = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user
 *               - products
 *               - paymentMethod
 *               - totalPrice
 *             properties:
 *               user:
 *                 type: string
 *                 format: uuid
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - product
 *                     - quantity
 *                     - price
 *                   properties:
 *                     product:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                     price:
 *                       type: number
 *                       minimum: 0
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
 *               totalPrice:
 *                 type: number
 *                 minimum: 0
 *               shippingCost:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *               estimatedDelivery:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       '201':
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Order created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       '400':
 *         description: Bad request, invalid input data
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '500':
 *         description: Internal server error
 *
 *   get:
 *     summary: Get all orders (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: orderStatus
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled, returned]
 *         description: Filter by order status
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded]
 *         description: Filter by payment status
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders up to this date
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       '200':
 *         description: List of all orders
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalOrders:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, user does not have permission to view orders
 *       '500':
 *         description: Internal server error
 */
router
  .route('/')
  .post(authenticate, asyncHandler(OrderController.createOrder))
  .get(
    authenticate,
    checkRole('admin', 'read'),
    asyncHandler(OrderController.getAllOrders)
  );

/**
 * @openapi
 * /api/orders/stats:
 *   get:
 *     summary: Get order statistics (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Order statistics retrieved successfully
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
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalOrders:
 *                           type: integer
 *                         totalRevenue:
 *                           type: number
 *                           format: float
 *                         averageOrderValue:
 *                           type: number
 *                           format: float
 *                         pendingOrders:
 *                           type: integer
 *                         processingOrders:
 *                           type: integer
 *                         shippedOrders:
 *                           type: integer
 *                         deliveredOrders:
 *                           type: integer
 *                         cancelledOrders:
 *                           type: integer
 *                     monthlyTrends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: object
 *                             properties:
 *                               year:
 *                                 type: integer
 *                               month:
 *                                 type: integer
 *                           ordersCount:
 *                             type: integer
 *                           revenue:
 *                             type: number
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
  checkRole('admin', 'read'),
  asyncHandler(OrderController.getOrderStats)
);

/**
 * @openapi
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update the status of an order (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled, returned]
 *               trackingNumber:
 *                 type: string
 *               deliveredAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       '200':
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Order updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       '400':
 *         description: Bad request, invalid input data
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, user does not have permission to update order status
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Internal server error
 */
router.put(
  '/:id/status',
  authenticate,
  checkRole('admin', 'edit'),
  asyncHandler(OrderController.updateOrderStatus)
);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Get an order by ID (authenticated user or admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     responses:
 *       '200':
 *         description: Order retrieved successfully
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
 *                   $ref: '#/components/schemas/Order'
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *     responses:
 *       '200':
 *         description: Order deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Order marked as deleted
 *       '401':
 *         description: Unauthorized, user not authenticated
 *       '403':
 *         description: Forbidden, user does not have permission to delete the order
 *       '404':
 *         description: Order not found
 *       '500':
 *         description: Internal server error
 */
router
  .route('/:id')
  .get(authenticate, asyncHandler(OrderController.getOrderById))
  .delete(
    authenticate,
    checkRole('admin', 'delete'),
    asyncHandler(OrderController.deleteOrder)
  );

module.exports = router;
