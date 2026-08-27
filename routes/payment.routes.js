import express from 'express';
import db from '../db.js';
import paginationMiddleware from '../middlewares/pagination.middleware.js';

const router = express.Router();

router.get('/:id', paginationMiddleware, async (req, res) => {
    let result = await db.query(
        `
            SELECT
                p.id, p.status, p.order_id
            FROM payments p
            INNER JOIN orders o ON o.id = p.order_id
            WHERE p.id = $1 AND o.user_id = $2
        `, [ req.params.id, req.userData.id ]
    );

    return res.json({
        message: 'OK',
        data: result.rows
    });
});

router.get('/:id/process', async (req, res) => {
    let result = await db.query(
        `
            SELECT
                p.id, p.status, p.order_id
            FROM payments p
            INNER JOIN orders o ON o.id = p.order_id
            WHERE p.id = $1 AND o.user_id = $2
        `, [ req.params.id, req.userData.id ]
    );

    if (result.rowCount === 0) {
        throw new Error('Invalid payment ID')
    }

    const conn = await db.connect();

    try {
        await conn.query('BEGIN');

        // Update payment status
        result = await db.query(
            `
                UPDATE payments
                SET
                    status = 'PAID'
                WHERE
                    id = $1 and status = 'PENDING'
                RETURNING *
            `, [ result.rows[0].id ]
        );

        const paymentDetails = result.rows?.slice()?.at(0);

        // Update order status
        result = await db.query(
            `
                UPDATE orders
                SET
                    status = 'PAID'
                WHERE
                    id = $1 and status = 'PENDING'
                RETURNING *
            `, [ paymentDetails.order_id ]
        );
    
        await conn.query('COMMIT');
        conn.release();

        return res.json({
            message: result.rowCount > 0 ? 'OK' : 'Failed',
            data: result.rows[0]
        })
    } catch (error) {
        await conn.query('ROLLBACK');

        console.error(error)
    }

    conn.release();

    return res.json({
        message: 'Failed'
    })
});

router.get('/:id/refund', async (req, res) => {
    let result = await db.query(
        `
            SELECT
                p.id, p.status, p.order_id
            FROM payments p
            INNER JOIN orders o ON o.id = p.order_id
            WHERE p.id = $1 AND o.user_id = $2
        `, [ req.params.id, req.userData.id ]
    );

    if (result.rowCount === 0) {
        throw new Error('Invalid payment ID')
    }

    result = await db.query(
        `
            UPDATE payments
            SET
                status = 'REFUNDED'
            WHERE
                id = $1 and status = 'PAID'
            RETURNING *
        `, [ result.rows[0].id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    })
});

export default router;