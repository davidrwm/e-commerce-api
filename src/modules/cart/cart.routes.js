const express = require("express");

const {
  get,
  add,
  update,
  remove,
  clear,
} = require("./cart.controller");

const { authenticate } = require("../../middleware/auth");

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Get the current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartResponse'
 *       401:
 *         description: Authentication required
 */
router.get("/", get);

/**
 * @swagger
 * /api/v1/cart/items:
 *   post:
 *     summary: Add a product to the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       201:
 *         description: Cart item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItemResponse'
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Product not found
 *       409:
 *         description: Insufficient stock
 */
router.post("/items", add);

/**
 * @swagger
 * /api/v1/cart/items/{productId}:
 *   patch:
 *     summary: Update the quantity of a cart item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItemResponse'
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Cart item or product not found
 *       409:
 *         description: Insufficient stock
 */
router.patch(
  "/items/:productId",
  update
);

/**
 * @swagger
 * /api/v1/cart/items/{productId}:
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Cart item removed successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Cart item not found
 */
router.delete(
  "/items/:productId",
  remove
);

/**
 * @swagger
 * /api/v1/cart:
 *   delete:
 *     summary: Clear the current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Cart cleared successfully
 *       401:
 *         description: Authentication required
 */
router.delete("/", clear);

module.exports = router;