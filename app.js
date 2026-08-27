import express from 'express';
import authRouter from './routes/auth.routes.js';
import categoryRouter from './routes/category.routes.js';
import productRouter from './routes/product.routes.js';
import userRouter from './routes/user.routes.js';
import addressRouter from './routes/address.routes.js';
import cartRouter from './routes/cart.routes.js';
import orderRouter from './routes/order.routes.js';
import paymentRouter from './routes/payment.routes.js';
import adminRouter from './routes/admin.routes.js';
import webhookRouter from './routes/webhook.routes.js';

import errorMiddleware from './middlewares/error.middleware.js';
import authMiddleware from './middlewares/auth.middleware.js';
import adminMiddleware from './middlewares/admin.middleware.js';

const SERVER_PORT = process.env.SERVER_PORT || 9090;

const app = express();

app.use('/auth', authRouter);
app.use('/users', authMiddleware, userRouter);
app.use('/categories', categoryRouter);
app.use('/products', productRouter);
app.use('/addresses', authMiddleware, addressRouter);
app.use('/cart', authMiddleware, cartRouter);
app.use('/orders', authMiddleware, orderRouter);
app.use('/payments', authMiddleware, paymentRouter);
app.use('/admin', adminMiddleware, adminRouter);
app.use('/webhooks', webhookRouter);

app.all('/*splat', (req, res, next) => {
    next(new Error('Not found'));
});

app.use(errorMiddleware);

app.listen(SERVER_PORT, (error) => {
    if (error) {
        console.error(error);
    } else {
        console.log(`Server started on port ${SERVER_PORT}`);
    }
});