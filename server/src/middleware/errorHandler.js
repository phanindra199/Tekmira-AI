import { config } from '../config/env.js';

/**
 * Centralized Server Error-Handling Middleware
 * Express recognizes error-handling middleware by its 4 arguments: (err, req, res, next)
 * 
 * Enforces enterprise security standards:
 * - Catches asynchronous and synchronous errors
 * - Translates ORM/database error codes into proper HTTP status codes
 * - Formats field-level validation errors
 * - Strictly strips stack traces and internal database strings in production
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // 1. Prisma ORM Specific Error Mapping
  if (err.code === 'P2002') {
    // Unique constraint violation (e.g. duplicate email or unique index)
    statusCode = 409;
    const target = err.meta?.target ? ` on field: ${err.meta.target}` : '';
    message = `A conflicting record already exists${target}.`;
  } else if (err.code === 'P2025') {
    // Record to update/delete not found
    statusCode = 404;
    message = 'The requested database record was not found.';
  }

  // 2. Mongoose ODM Specific Error Mapping
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for resource identifier: ${err.value}`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed for document properties';
    errors = Object.values(err.errors || {}).map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // 3. Security Sanitization for Production 500 Errors
  if (statusCode >= 500 && config.isProduction) {
    message = 'An unexpected internal server error occurred. Please contact support.';
  }

  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  // Include stack trace only in non-production environments
  if (!config.isProduction && err.stack) {
    response.stack = err.stack;
  }

  // Safe logging
  if (statusCode >= 500) {
    console.error(`[Server Error] ${err.name || 'Error'}: ${err.message}`);
    if (err.stack && !config.isProduction) console.error(err.stack);
  }

  return res.status(statusCode).json(response);
};

export default errorHandler;
