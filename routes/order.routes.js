import express from 'express';
import db from '../db.js';
import paginationMiddleware from '../middlewares/pagination.middleware.js';

const router = express.Router();

router.get('/', paginationMiddleware, async (req, res) => {
    let result = await db.query(
        'SELECT * FROM orders WHERE user_id = $1 LIMIT $2 OFFSET $3',
        [ req.userData.id, req.pageSize, req.pageOffset ]
    );

    return res.json({
        message: 'OK',
        data: result.rows
    });
});

router.get('/create', async (req, res) => {
    // Validation
    let { addressId } = req.query;

    addressId = addressId?.trim() || '';

    if (!addressId.length) {
        throw new Error('Address ID is required');
    }

    // Get user cart
    let result = await conn.query(
        'SELECT id FROM carts WHERE user_id = $1',
        [ req.userData.id ]
    );

    if (result.rowCount === 0) {
        throw new Error('Your cart is empty');
    }

    const cartId = result.rows[0].id;

    // Get cart items
    result = await conn.query(
        `
            SELECT
                ci.id, ci.product_id, ci.quantity,
                p.price
            FROM cart_items ci
            INNER JOIN products p ON p.id = ci.product_id
            WHERE cart_id = $1
        `,
        [ cartId ]
    );
    
    // Make sure cart is not empty
    if (result.rowCount === 0) {
        throw new Error('Your cart is empty');
    }

    // Calculate total
    const total = result.rows.reduce((acc, item) => acc += item.price * item.quantity, 0);

    // Create order items array
    const orderItems = result.rows.slice();

    const conn = await db.connect();

    try {
        await conn.query('BEGIN');

        // Create new order
        result = await conn.query(
            `
                INSERT INTO orders
                (total, user_id, address_id)
                VALUES ($1, $2, $3)
                RETURNING *
            `, [ total, req.userData.id, addressId ]
        )

        const orderDetails = result.rows.slice()[0];
        
        // Create order items
        orderItems.forEach(async (item) => {
            await conn.query(
                `
                    INSERT INTO order_items
                    (price, quantity, product_id, order_id)
                    VALUES ($1, $2, $3, $4)
                `, [ item.price, item.quantity, item.product_id, orderDetails.id ]
            )
        });

        // Empty cart
        // Create payment
        result = await conn.query(
            `
                INSERT INTO payments
                (order_id)
                VALUES ($1)
                RETURNING *
            `, [ orderDetails.id ]
        );

        await conn.query('COMMIT');

        conn.release();

        return res.json({
            message: 'OK',
            order: orderDetails,
            payment: result.rows[0]
        });
    } catch (error) {
        await conn.query('ROLLBACK');

        console.error(error);
    }

    conn.release();

    return res.json({
        message: 'Failed'
    });
});

router.get('/:id', async (req, res) => {
    // Get order details
    let result = await db.query(
        'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
        [ req.params.id, req.userData.id ]
    );
    
    const orderDetails = result.rows?.slice()?.at(0);

    result = await db.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [ orderDetails?.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Not Found',
        orderDetails: orderDetails,
        orderItems: result.rows
    });
});

router.get('/:id/cancel', async (req, res) => {
    // Order can only be cancelled by the customer
    // if the status is still 'PENDING'
    let result = await db.query(
        `
            UPDATE orders
            SET
                status = \'CANCELLED\'
            WHERE
                id = $1 AND
                user_id = $2 AND
                status = 'PENDING'
        `,
        [ req.params.id, req.userData.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed'
    });
});

export default router;