import express from 'express';
import db from '../db.js';
import paginationMiddleware from '../middlewares/pagination.middleware.js';

const router = express.Router();

router.get('/payment', async (req, res) => {
    let { event, paymentId } = req.query;

    event = event?.trim() || '';
    paymentId = paymentId?.trim() || '';

    if (!event.length || !paymentId.length) {
        throw new Error('Event and payment ID are required');
    }

    // Validate event
    const allowedEvents = ['PAYMENT_SUCCESS', 'PAYMENT_FAILED'];

    if (!allowedEvents.find(item => item === event)) {
        throw new Error('Unknown event');
    }

    // Payment status changes
    const paymentStatusChange = {
        'PAYMENT_SUCCESS': 'PAID',
        'PAYMENT_FAILED': 'FAILED',
    };

    // Order status changes
    const orderStatusChange = {
        'PAYMENT_SUCCESS': 'PAID',
        'PAYMENT_FAILED': 'CANCELLED',
    };

    const conn = await db.connect();

    try {
        await conn.query('BEGIN');

        // Update payment
        let result = await conn.query(
            `
                UPDATE payments
                SET
                    status = $1
                WHERE
                    id = $2 AND
                    status = 'PENDING'
                RETURNING *
            `, [ paymentStatusChange[event], paymentId ]
        );

        // Update order
        result = await conn.query(
            `
                UPDATE orders
                SET
                    status = $1
                WHERE
                    id = $2 AND
                    status = 'PENDING'
                RETURNING *
            `, [ orderStatusChange[event], result.rows[0]?.order_id ]
        );

        await conn.query('COMMIT');
        conn.release();

        return res.json({
            message: result.rowCount > 0 ? 'OK' : 'Failed'
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

export default router;