import express from 'express';
import db from '../db.js';
import paginationMiddleware from '../middlewares/pagination.middleware.js';

const router = express.Router();

router.get('/list', paginationMiddleware, async (req, res) => {
    let result = await db.query(
        'SELECT * FROM addresses WHERE user_id = $1 LIMIT $2 OFFSET $3',
        [ req.userData.id, req.pageSize, req.pageOffset ]
    );

    return res.json({
        message: 'OK',
        data: result.rows
    });
});

router.get('/create', async (req, res) => {
    let { name, street, city, postalCode, country } = req.query;

    name = name?.trim() || '';
    street = street?.trim() || '';
    city = city?.trim() || '';
    postalCode = postalCode?.trim() || '';
    country = country?.trim() || '';

    if (!name.length || !street.length || !city.length || !postalCode.length || !country.length) {
        throw new Error("Name, street, city, postal code, and country are required");
    }

    let result = await db.query(
        `
            INSERT INTO addresses
            (name, street, city, postal_code, country, user_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [ name, street, city, postalCode, country, req.userData.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    });
});

router.get('/:id/details', async (req, res) => {
    let result = await db.query(
        'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
        [ req.params.id, req.userData.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Not Found',
        data: result.rows[0]
    });
});

router.get('/:id/update', async (req, res) => {
    let { name, street, city, postalCode, country } = req.query;

    name = name?.trim() || '';
    street = street?.trim() || '';
    city = city?.trim() || '';
    postalCode = postalCode?.trim() || '';
    country = country?.trim() || '';

    if (!name.length || !street.length || !city.length || !postalCode.length || !country.length) {
        throw new Error("Name, street, city, postal code, and country are required");
    }

    let result = await db.query(
        `
            UPDATE addresses
            SET
                name = $1,
                street = $2,
                city = $3,
                postal_code = $4,
                country = $5
            WHERE id = $6 AND user_id = $7
            RETURNING *
        `, [ name, street, city, postalCode, country, req.params.id, req.userData.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    });
});

router.get('/:id/delete', async (req, res) => {
    let result = await db.query(
        'DELETE FROM addresses WHERE id = $1 AND user_id = $2',
        [ req.params.id, req.userData.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    });
});

export default router;