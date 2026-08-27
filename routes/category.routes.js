import express from 'express';
import db from '../db.js';
import paginationMiddleware from '../middlewares/pagination.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';

const router = express.Router();

// Get list of categories
router.get('/list', paginationMiddleware, async (req, res) => {
    let result = await db.query(
        'SELECT * FROM categories LIMIT $1 OFFSET $2',
        [ req.pageSize, req.pageOffset ]
    );

    return res.json({
        message: 'OK',
        data: result.rows
    });
});

// Get details for a category
router.get('/:id/details', async (req, res) => {
    let result = await db.query(
        'SELECT * FROM categories WHERE id = $1',
        [ req.params.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    });
});

// Create a new category
router.get('/create', adminMiddleware, async (req, res) => {
    let { id, name, description } = req.query;

    id = id?.trim() || '';
    name = name?.trim() || '';
    description = description?.trim() || '';

    if (!id.length || !name.length) {
        throw new Error("Category ID and name are required");
    }

    let result = await db.query(
        `
            INSERT INTO categories
            (id, name, description)
            VALUES ($1, $2, $3)
            ON CONFLICT (id)
            DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description
            RETURNING *
        `, [ id, name, description ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    });
});

// Update a category
router.get('/:id/update', adminMiddleware, async (req, res) => {
    let { name, description } = req.query;

    name = name?.trim() || '';
    description = description?.trim() || '';

    if (!name.length) {
        throw new Error("Category name is required");
    }

    let result = await db.query(
        `
            UPDATE categories
            SET
                name = $1,
                description = $2
            WHERE
                id = $3
            RETURNING *
        `, [ name, description, req.params.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    });
});

// Delete a category
router.get('/:id/delete', adminMiddleware, async (req, res) => {
    let result = await db.query(
        'DELETE FROM categories WHERE id = $1',
        [ req.params.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    });
});

// Get products for a category
router.get('/:id/products', paginationMiddleware, async (req, res) => {
    let result = await db.query(
        'SELECT * FROM products WHERE category_id = $1 LIMIT $2 OFFSET $3',
        [ req.params.id, req.pageSize, req.pageOffset ]
    );

    return res.json({
        message: 'OK',
        data: result.rows
    });
});

export default router;