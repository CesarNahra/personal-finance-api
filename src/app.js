import express from 'express';

import healthRoutes from './routes/healthRoutes.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/api', healthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;