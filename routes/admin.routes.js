import express from 'express';
import db from '../db.js';
import paginationMiddleware from '../middlewares/pagination.middleware.js';

const router = express.Router();

// User routes
router.get('/users', paginationMiddleware, async (req, res) => {
    let result = await db.query(
        'SELECT * FROM users LIMIT $1 OFFSET $2',
        [ req.pageSize, req.pageOffset ]
    );

    return res.json({
        message: 'OK',
        data: result.rows
    });
});

router.get('/users/:id', async (req, res) => {
    let result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [ req.params.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Not found',
        data: result.rows[0]
    });
});

router.get('/users/:id/role', async (req, res) => {
    let { role } = req.query;

    role = role?.trim() || '';

    if (!role.length) {
        throw new Error('Role is required');
    }

    let result = await db.query(
        `
            UPDATE users
            SET
                role = $1
            WHERE
                id = $2
            RETURNING *
        `, [ role, req.params.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    });
});

router.get('/users/:id/role', async (req, res) => {
    let { role } = req.query;

    role = role?.trim() || '';

    if (!role.length) {
        throw new Error('Role is required');
    }

    let result = await db.query(
        `
            UPDATE users
            SET
                role = $1
            WHERE
                id = $2
            RETURNING *
        `, [ role, req.params.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    });
});

router.get('/users/:id/status', async (req, res) => {
    let { status } = req.query;

    status = status?.trim() || '';

    if (!status.length) {
        throw new Error('Status is required');
    }

    let result = await db.query(
        `
            UPDATE users
            SET
                status = $1
            WHERE
                id = $2
            RETURNING *
        `, [ status, req.params.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    });
});

// Order routes
router.get('/orders', paginationMiddleware, async (req, res) => {
    let result = await db.query(
        'SELECT * FROM orders LIMIT $1 OFFSET $2',
        [ req.pageSize, req.pageOffset ]
    );

    return res.json({
        message: 'OK',
        data: result.rows
    });
});

router.get('/orders/:id', async (req, res) => {
    let result = await db.query(
        'SELECT * FROM orders WHERE id = $1',
        [ req.params.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Not found',
        data: result.rows[0]
    });
});

router.get('/orders/:id/status', async (req, res) => {
    let { status } = req.query;

    status = status?.trim() || '';

    if (!status.length) {
        throw new Error('Status is required');
    }

    // Check the order's status before updating it

    /*
        Allowed status changes

        PENDING:
            - CANCELLED

        PAID:
            - PROCESSING
            - CANCELLED
        
        PROCESSING:
            - SHIPPED
            - CANCELLED
        
        SHIPPED:
            - DELIVERED
    */

    const allowedChanges = {
        'PENDING': [ 'CANCELLED' ],
        'PAID': [ 'PROCESSING', 'CANCELLED' ],
        'PROCESSING': [ 'SHIPPED', 'CANCELLED' ],
        'SHIPPED': [ 'DELIVERED' ],
        'DELIVERED': [],
        'CANCELLED': []
    };

    // Get the order's status
    let result = await db.query(
        'SELECT status FROM orders WHERE id = $1',
        [ req.params.id ]
    );

    if (result.rowCount === 0) {
        throw new Error('Invalid order ID');
    }

    const orderStatus = result.rows[0].status;

    if (!allowedChanges[orderStatus].find(item => item === status)) {
        throw new Error(`Status change from '${orderStatus}' to '${status}' is not allowed`);
    }

    result = await db.query(
        `
            UPDATE orders
            SET
                status = $1
            WHERE
                id = $2
            RETURNING *
        `, [ status, req.params.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    });
});

export default router;