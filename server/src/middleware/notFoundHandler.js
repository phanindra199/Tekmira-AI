import { AppError } from '../utils/AppError.js';

/**
 * 404 Route Not Found Middleware
 * Intercepts any request that does not match a registered route
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Resource not found at ${req.originalUrl}`, 404);
  next(error);
};
