import axios from 'axios';
import { normalizeApiError } from '../utils/apiError';

/**
 * Tekmira AI Centralized Axios HTTP Client
 * 
 * Configured with:
 * - Vite environment variable base URL (VITE_API_BASE_URL)
 * - Safe 15-second request timeouts
 * - JSON serialization headers
 * - Request authorization token injection (Phase 2 ready)
 * - Normalized, safe response and error interceptors (no stack traces)
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

// Request Interceptor: Attach authentication token if present in localStorage
apiClient.interceptors.request.use(
  (config) => {
    // When JWT auth is integrated (Day 6), token will be attached here:
    const token = typeof window !== 'undefined' ? localStorage.getItem('tekmira_auth_token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(normalizeApiError(error));
  }
);

// Response Interceptor: Unwrap standardized JSON payload or normalize errors
apiClient.interceptors.response.use(
  (response) => {
    // Backend returns standard ApiResponse: { success: true, message: "...", data: {...} }
    return response.data;
  },
  (error) => {
    // Map network errors, HTTP status codes, and timeouts to sanitized ApiError
    const normalized = normalizeApiError(error);
    return Promise.reject(normalized);
  }
);

export default apiClient;
