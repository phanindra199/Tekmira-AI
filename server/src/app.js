import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

// 1. Initialize Express Application
const app = express();

// 2. Configure Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Configure Request Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Mount Master API Router
app.use('/api', apiRoutes);

// 5. 404 Not Found Middleware (Catch-all for unregistered endpoints)
app.use(notFoundHandler);

// 6. Centralized Error-Handling Middleware (Must be registered last)
app.use(errorHandler);

export default app;
