import express from 'express';
import db from '../db.js';
import paginationMiddleware from '../middlewares/pagination.middleware.js';

const router = express.Router();

// Get the current user's cart
router.get('/', paginationMiddleware, async (req, res) => {
    let result = await db.query(
        `
            SELECT
                c.id AS cart_id,
                ci.id AS cart_item_id,
                ci.product_id,
                p.price,
                ci.quantity,
                (p.price * ci.quantity) AS total
            FROM carts c
            INNER JOIN cart_items ci ON c.id = ci.cart_id
            INNER JOIN products p ON p.id = ci.product_id
            WHERE c.user_id = $1
            LIMIT $2 OFFSET $3
        `, [ req.userData.id, req.pageSize, req.pageOffset ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Your cart is empty',
        data: result.rows
    });
});

// Update a cart item
router.get('/items/:productId/update', async (req, res) => {
    let { quantity } = req.query;

    quantity = parseInt(quantity || 0);

    if (quantity <= 0) {
        throw new Error('Quantity must be greater than zero');
    }

    // Make sure the requested quantity does not exceed
    // the product's stock
    let result = await db.query(
        'SELECT stock FROM products WHERE id = $1',
        [ req.params.productId ]
    );

    if (quantity > (result.rows[0]?.stock || 0)) {
        throw new Error('Requested quantity exceeds product stock')
    }

    // Get the current user's cart
    result = await db.query(
        'SELECT id FROM carts WHERE user_id = $1',
        [ req.userData.id ]
    );

    const cartId = result.rows[0]?.id || 0;

    result = await db.query(
        `
            UPDATE cart_items
            SET
                quantity = $1 
            WHERE
                cart_id = $2 AND product_id = $3
            RETURNING *
        `,
        [ quantity, cartId, req.params.productId ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    })
});

// Add an item to the current user's cart
router.get('/items/add', async (req, res) => {
    let { productId, quantity } = req.query;

    productId = productId?.trim() || '';

    quantity = quantity || 0;
    quantity = parseInt(quantity);

    if (!productId.length) {
        throw new Error('Product ID is required');
    }

    if (quantity <= 0) {
        throw new Error("Quantity must be greater than zero");
    }

    // Get the current user's cart
    let result = await db.query(
        'SELECT id FROM carts WHERE user_id = $1',
        [ req.userData.id ]
    );
    
    // Create a cart for the user if there's not one yet
    if (result.rowCount === 0) {
        result = await db.query(
            'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
            [ req.userData.id ]
        );
    }

    const cartId = result.rows[0].id;

    // Check if the product is already in the cart
    result = await db.query(
        'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [ cartId, productId ]
    );

    const cartItem = result.rows[0];

    // If the product is already in the cart, add the cart item's quantity
    // with the quantity in the request body
    if (cartItem) {
        quantity += parseInt(result.rows[0].quantity);
    }

    // Make sure the new quantity doesn't exceed the product's stock
    result = await db.query(
        'SELECT stock FROM products WHERE id = $1',
        [ productId ]
    );

    if (quantity > parseInt(result.rows[0].stock)) {
        throw new Error("Requested quantity exceeds product stock");
    }

    if (cartItem) {
        // Update the cart item's quantity field
        result = await db.query(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *',
            [ quantity, cartItem.id ]
        );

        return res.json({
            message: result.rowCount > 0 ? 'OK' : 'Failed',
            data: result.rows[0]
        });
    }

    // Add the product to the cart
    result = await db.query(
        `
            INSERT INTO cart_items
            (cart_id, product_id, quantity)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [ cartId, productId, quantity ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    });
});

// Remove an item from the cart
router.get('/items/:productId/delete', async (req, res) => {
    let result = await db.query(
        'SELECT id FROM carts WHERE user_id = $1',
        [ req.userData.id ]
    );

    const cartId = result.rows[0]?.id || 0;

    result = await db.query(
        'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [ cartId, req.params.productId ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed'
    });
});

// Empty the current user's cart
router.get('/delete', async (req, res) => {
    let result = await db.query(
        'DELETE FROM carts WHERE user_id = $1',
        [ req.userData.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed'
    });
});

export default router;