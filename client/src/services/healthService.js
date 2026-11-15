import apiClient from './apiClient';

/**
 * Health Check API Service
 * Interacts with GET /api/health on the Express backend
 * 
 * Supports:
 * - AbortController signal for safe cleanup on component unmount
 * - Structured connected/error status states
 * - Sanitized user-facing error reporting
 * 
 * @param {object} [options]
 * @param {AbortSignal} [options.signal] - Optional cancellation signal
 * @returns {Promise<{ connected: boolean, data?: object, message?: string, error?: string, isCancelled?: boolean }>}
 */
export const checkBackendHealth = async ({ signal } = {}) => {
  try {
    const data = await apiClient.get('/health', { signal });
    return {
      connected: true,
      data,
      message: data?.message || 'Tekmira AI backend is active'
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message || 'Unable to connect to backend server',
      type: error.type || 'UNKNOWN_ERROR',
      isCancelled: !!error.isCancelled
    };
  }
};

export default { checkBackendHealth };
