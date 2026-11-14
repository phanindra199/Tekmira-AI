import apiClient from './apiClient';

/**
 * Health Check API Service
 * Interacts with GET /api/health on the Express backend
 */
export const checkBackendHealth = async () => {
  try {
    const data = await apiClient.get('/health');
    return {
      connected: true,
      data
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message || 'Unable to connect to backend server'
    };
  }
};
