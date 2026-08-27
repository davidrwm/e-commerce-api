import express from 'express';
import jwt from 'jsonwebtoken';

import db from '../db.js';
import { compareSync, hashSync } from 'bcrypt';

const router = express.Router();

router.get('/register', async (req, res) => {
    let { email, password } = req.query;

    email = email?.trim() || '';
    password = password?.trim() || '';

    if (!email.length || !password.length) {
        throw new Error('Email and password are required');
    }

    let result = await db.query(
        'SELECT email FROM users WHERE email = $1',
        [ email ]
    );

    if (result.rowCount > 0) {
        throw new Error('Email is already registered');
    }

    const passwordHash = hashSync(password, 10);

    result = await db.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, \'CUSTOMER\') RETURNING *',
        [ email, passwordHash ]
    );

    return res.json({
        message: 'OK'
    });
});

router.get('/login', async (req, res) => {
    let { email, password } = req.query;

    email = email?.trim() || '';
    password = password?.trim() || '';

    if (!email.length || !password.length) {
        throw new Error('Email and password are required');
    }

    // Get the user data
    let result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [ email ]
    );

    if (result.rowCount === 0) {
        throw new Error('Invalid credentials');
    }

    const userData = result.rows[0];

    // Check if the user is disabled
    if (userData.status === 'DISABLED') {
        throw new Error('User has been disabled');
    }

    // Compare the passwords
    if (compareSync(password, userData.password) === false) {
        throw new Error('Invalid credentials');
    }

    // Create JWT token
    const token = jwt.sign(
        { id: userData.id, email: userData.email, role: userData.role },
        process.env.SECRET_KEY, { expiresIn: 3600 }
    );

    return res.json({
        message: 'OK',
        data: token
    })
});

export default router;