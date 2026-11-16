import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';

// 1. Initialize Express Application
const app = express();

// 2. Configure Dynamic Cross-Origin Resource Sharing (CORS) with Production Whitelisting
const parseAllowedOrigins = (clientUrlSetting) => {
  if (!clientUrlSetting) return ['http://localhost:5173', 'http://localhost:3000'];
  return clientUrlSetting
    .split(',')
    .map(url => url.trim().replace(/\/$/, ''))
    .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins(config.clientUrl);

app.use(cors({
  origin: (origin, callback) => {
    // Permit non-browser HTTP clients (cURL, Supertest, background workers, server-to-server)
    if (!origin) return callback(null, true);
    
    // Exact whitelisted origin match or wildcard
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    // In local non-production environments, allow localhost on any port
    if (!config.isProduction && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy violation: Origin '${origin}' is not authorized`));
  },
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
