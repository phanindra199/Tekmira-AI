/**
 * Custom Operational Application Error
 * Allows setting HTTP status codes and operational flags
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Distinguishes operational errors from programming bugs

    Error.captureStackTrace(this, this.constructor);
  }
}
