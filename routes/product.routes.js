import express from 'express';
import db from '../db.js';
import paginationMiddleware from '../middlewares/pagination.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';

const router = express.Router();

router.get('/list', paginationMiddleware, async (req, res) => {
    let result = await db.query(
        'SELECT * FROM products LIMIT $1 OFFSET $2',
        [ req.pageSize, req.pageOffset ]
    );

    return res.json({
        message: 'OK',
        data: result.rows
    });
});

router.get('/create', adminMiddleware, async (req, res) => {
    let { name, description, price, stock, category } = req.query;

    name = name?.trim() || '';
    description = description?.trim() || '';
    price = price || 0;
    stock = stock || 0;
    category = category?.trim() || '';

    if (!name.length || !category.length) {
        throw new Error("Product name and category are required");
    }

    if (price <= 0 || stock <= 0) {
        throw new Error("Price and stock must be greater than zero")
    }

    let result = await db.query(
        `
            INSERT INTO products
            (name, description, price, stock, category_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [ name, description, price, stock, category ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    });
});

router.get('/:id/details', async (req, res) => {
    let result = await db.query(
        'SELECT * FROM products WHERE id = $1',
        [ req.params.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Not Found',
        data: result.rows[0]
    });
})

router.get('/:id/update', adminMiddleware, async (req, res) => {
    let { name, description, price, stock, category } = req.query;

    name = name?.trim() || '';
    description = description?.trim() || '';
    price = price || 0;
    stock = stock || 0;
    category = category?.trim() || '';

    if (!name.length || !category.length) {
        throw new Error("Product name and category are required");
    }

    if (price <= 0 || stock <= 0) {
        throw new Error("Price and stock must be greater than zero")
    }

    let result = await db.query(
        `
            UPDATE products
            SET
                name = $1,
                description = $2,
                price = $3,
                stock = $4,
                category_id = $5
            WHERE id = $6
            RETURNING *
        `, [ name, description, price, stock, category, req.params.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    });
});

router.get('/:id/delete', adminMiddleware, async (req, res) => {
    let result = await db.query(
        'DELETE FROM products WHERE id = $1',
        [ req.params.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed'
    });
});

export default router;