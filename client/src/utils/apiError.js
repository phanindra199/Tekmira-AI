import axios from 'axios';

/**
 * Standardized Client-Side API Error Structure
 * Ensures no server stack traces, database internals, or credentials reach user interfaces.
 */
export class ApiError extends Error {
  constructor({
    message,
    statusCode = 0,
    type = 'UNKNOWN_ERROR',
    errors = null,
    isNetworkError = false,
    isCancelled = false,
    originalError = null
  }) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.type = type;
    this.errors = errors;
    this.isNetworkError = isNetworkError;
    this.isCancelled = isCancelled;
    this.timestamp = new Date().toISOString();

    // Preserve original error in non-production environments for developer debugging
    const isDev = (typeof import.meta !== 'undefined' && import.meta.env?.DEV) || 
                  (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production');
    if (isDev) {
      this.originalError = originalError;
    }
  }
}

/**
 * Normalizes any caught Axios or generic error into a predictable ApiError instance
 * @param {any} error - Caught error object
 * @returns {ApiError}
 */
export function normalizeApiError(error) {
  // 1. Request cancelled by AbortController
  if (axios.isCancel(error) || error?.name === 'CanceledError' || error?.name === 'AbortError') {
    return new ApiError({
      message: 'Request was cancelled.',
      statusCode: 0,
      type: 'REQUEST_CANCELLED',
      isCancelled: true,
      originalError: error
    });
  }

  // 2. Network Failure / Backend Offline / Timeout
  if (!error.response) {
    let message = 'Unable to connect to the Tekmira AI server. Please ensure the backend is running.';
    let type = 'NETWORK_ERROR';

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message = 'Request timed out. The server took too long to respond.';
      type = 'TIMEOUT_ERROR';
    } else if (error.message === 'Network Error') {
      message = 'Network connection failed. Please check your network or CORS configuration.';
    }

    return new ApiError({
      message,
      statusCode: 0,
      type,
      isNetworkError: true,
      originalError: error
    });
  }

  // 3. HTTP Response Received with Error Status (4xx, 5xx)
  const status = error.response.status;
  const data = error.response.data || {};

  switch (status) {
    case 400:
      return new ApiError({
        message: data.message || 'Invalid request. Please check your submission.',
        statusCode: 400,
        type: 'VALIDATION_ERROR',
        errors: data.errors || null,
        originalError: error
      });

    case 401:
      return new ApiError({
        message: data.message || 'Authentication required. Please sign in to continue.',
        statusCode: 401,
        type: 'UNAUTHORIZED',
        originalError: error
      });

    case 403:
      return new ApiError({
        message: data.message || 'Access denied. You do not have permission for this resource.',
        statusCode: 403,
        type: 'FORBIDDEN',
        originalError: error
      });

    case 404:
      return new ApiError({
        message: data.message || 'The requested resource was not found.',
        statusCode: 404,
        type: 'NOT_FOUND',
        originalError: error
      });

    case 409:
      return new ApiError({
        message: data.message || 'A conflict occurred with existing data.',
        statusCode: 409,
        type: 'CONFLICT',
        originalError: error
      });

    case 422:
      return new ApiError({
        message: data.message || 'Validation failed for the submitted information.',
        statusCode: 422,
        type: 'UNPROCESSABLE_ENTITY',
        errors: data.errors || null,
        originalError: error
      });

    case 429:
      return new ApiError({
        message: data.message || 'Too many requests. Please slow down and try again shortly.',
        statusCode: 429,
        type: 'RATE_LIMITED',
        originalError: error
      });

    case 500:
    case 502:
    case 503:
    case 504:
    default:
      // Critical security rule: Never expose stack traces or DB errors to user
      return new ApiError({
        message: status >= 500
          ? 'An internal server error occurred. Our engineering team has been notified.'
          : (data.message || 'An unexpected error occurred.'),
        statusCode: status,
        type: 'SERVER_ERROR',
        originalError: error
      });
  }
}

export default normalizeApiError;
