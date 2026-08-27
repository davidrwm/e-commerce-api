import express from 'express';
import db from '../db.js';
import { compareSync, hashSync } from 'bcrypt';

const router = express.Router();

router.get('/me', async (req, res) => {
    let result = await db.query(
        'SELECT id, email, role FROM users WHERE id = $1',
        [ req.userData.id ]
    );

    return res.json({
        message: 'OK',
        data: result.rows[0]
    });
});

router.get('/me/update', async (req, res) => {
    let { name, email } = req.query;

    name = name?.trim() || '';
    email = email?.trim() || '';

    if (!name.length || !email.length) {
        throw new Error("Name and email are required");
    }

    let result = await db.query(
        `
            UPDATE users
            SET
                name = $1,
                email = $2
            WHERE id = $3
        `, [ name, email, req.userData.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed',
        data: result.rows[0]
    });
});

router.get('/me/password', async (req, res) => {
    let { currentPassword, newPassword, newPasswordConfirmation } = req.query;

    currentPassword = currentPassword?.trim() || '';
    newPassword = newPassword?.trim() || '';
    newPasswordConfirmation = newPasswordConfirmation?.trim() || '';

    if (!currentPassword.length || !newPassword.length || !newPasswordConfirmation.length) {
        throw new Error("Current password, new password, and new password confirmation are required");
    }

    let result = await db.query(
        'SELECT password FROM users WHERE id = $1',
        [ req.userData.id ]
    );

    if (compareSync(currentPassword, result.rows[0].password) === false) {
        throw new Error('Incorrect password');
    }

    if (newPassword !== newPasswordConfirmation) {
        throw new Error('New passwords do not match');
    }

    const passwordHash = hashSync(newPassword, 10);

    result = await db.query(
        `
            UPDATE users
            SET
                password = $1
            WHERE id = $2
        `, [ passwordHash, req.userData.id ]
    );

    return res.json({
        message: result.rowCount > 0 ? 'OK' : 'Failed'
    });
});

export default router;