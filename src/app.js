import express from 'express';

import healthRoutes from './routes/healthRoutes.js';
import notFoundHandler from './middleware/notFoundHandler.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(express.json());

app.use('/api', healthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;