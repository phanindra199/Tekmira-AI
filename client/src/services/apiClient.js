import axios from 'axios';

/**
 * Global Axios API Client Instance
 * Configured with environment-based baseURL, timeouts, and headers
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor: Attach authentication tokens or log outbound requests
apiClient.interceptors.request.use(
  (config) => {
    // In Phase 2, we will attach JWT Bearer tokens here:
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Uniform error handling and response unwrapping
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Format error payload for consuming services
    const customError = {
      message: error.response?.data?.message || error.message || 'Network error occurred',
      statusCode: error.response?.status || 500,
      isNetworkError: !error.response
    };
    return Promise.reject(customError);
  }
);

export default apiClient;
