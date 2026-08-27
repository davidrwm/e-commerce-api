import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
    const authorization = req.headers.authorization?.trim() || req.query.token?.trim() || '';
    const token = jwt.verify(authorization, process.env.SECRET_KEY);

    if (token.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    req.userData = token;

    next();
}