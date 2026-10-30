const express = require("express");

const {
  checkout,
  getOrders,
  getOrder,
  getAdminOrders,
  changeOrderStatus,
} = require("./order.controller");

const {
  authenticate,
  authorize,
} = require("../../middleware/auth");

const router = express.Router();

const adminRouter = express.Router();

// Customer routes
router.use(authenticate);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Checkout the current user's cart
 *     description: Creates an order from the cart, checks product stock, reduces stock, and clears the cart within a database transaction.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateOrderResponse'
 *       400:
 *         description: Cart is empty
 *       401:
 *         description: Authentication required
 *       404:
 *         description: A product in the cart was not found
 *       409:
 *         description: Insufficient stock
 */
router.post("/", checkout);

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get the current user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MyOrdersResponse'
 *       401:
 *         description: Authentication required
 */
router.get("/", getOrders);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     description: Customers can only access their own orders.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderResponse'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Order not found
 */
router.get("/:id", getOrder);

// Admin routes
adminRouter.use(authenticate);
adminRouter.use(authorize("ADMIN"));

/**
 * @swagger
 * /api/v1/admin/orders:
 *   get:
 *     summary: Get all orders
 *     description: Admin-only endpoint with pagination and optional status filtering.
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED]
 *         description: Filter orders by status
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminOrderListResponse'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
adminRouter.get("/", getAdminOrders);

/**
 * @swagger
 * /api/v1/admin/orders/{id}/status:
 *   patch:
 *     summary: Update an order's status
 *     description: Updates the status according to the allowed order state transitions. Cancelling an eligible order restores stock.
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, SHIPPED, DELIVERED, CANCELLED]
 *                 example: CONFIRMED
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateOrderStatusResponse'
 *       400:
 *         description: Invalid status or transition
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Order not found
 */
adminRouter.patch("/:id/status", changeOrderStatus);

module.exports = {
  router,
  adminRouter,
};