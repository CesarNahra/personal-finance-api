import express from 'express';

import healthRoutes from './routes/healthRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import documentationRoutes from './routes/documentationRoutes.js';

import notFoundHandler from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(express.json({ strict: false }));

app.use('/api', healthRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api-docs', documentationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;