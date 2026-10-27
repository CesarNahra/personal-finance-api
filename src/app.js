import express from 'express';

import healthRoutes from './routes/healthRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

import notFoundHandler from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(express.json({ strict: false }));

app.use('/api', healthRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;