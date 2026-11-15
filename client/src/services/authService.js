import apiClient from './apiClient';

const TOKEN_KEY = 'tekmira_auth_token';
const USER_KEY = 'tekmira_user';

export const authService = {
  /**
   * Register a new candidate
   */
  async register(registrationData) {
    const response = await apiClient.post('/auth/register', registrationData);
    if (response?.data?.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Log in an existing candidate
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    if (response?.data?.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Fetch current authenticated candidate profile
   */
  async getMe() {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  /**
   * Log out candidate
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Get cached user profile
   */
  getStoredUser() {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};

export default authService;
