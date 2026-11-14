import { config } from '../config/env.js';

/**
 * Centralized Server Error-Handling Middleware
 * Express recognizes error-handling middleware by its 4 arguments: (err, req, res, next)
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = {
    success: false,
    message
  };

  // Include stack trace only in development environment
  if (!config.isProduction) {
    response.stack = err.stack;
  }

  // Log critical 500 errors to the console
  if (statusCode >= 500) {
    console.error(`[Server Error] ${err.name}: ${err.message}`);
    if (err.stack) console.error(err.stack);
  }

  return res.status(statusCode).json(response);
};
