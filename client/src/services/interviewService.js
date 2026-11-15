import apiClient from './apiClient';

export const interviewService = {
  /**
   * Start a new grounded technical viva interview session
   * 
   * @param {Object} params - { reportId?, difficulty?, targetRole? }
   * @returns {Promise<Object>} Created session data
   */
  async createSession(params = {}) {
    const response = await apiClient.post('/interview/sessions', params);
    return response.data;
  },

  /**
   * Submit an answer to a specific question for rubric evaluation
   * 
   * @param {Object} params - { sessionId, questionIndex, studentAnswer }
   * @returns {Promise<Object>} Evaluation results and updated score
   */
  async evaluateAnswer({ sessionId, questionIndex, studentAnswer }) {
    const response = await apiClient.post(`/interview/sessions/${sessionId}/evaluate`, {
      questionIndex,
      studentAnswer
    });
    return response.data;
  },

  /**
   * Fetch an existing session by ID
   * 
   * @param {string} sessionId 
   * @returns {Promise<Object>}
   */
  async getSessionById(sessionId) {
    const response = await apiClient.get(`/interview/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Fetch past interview sessions for candidate
   * 
   * @param {string} userId 
   * @returns {Promise<Object>}
   */
  async getUserSessions(userId) {
    const response = await apiClient.get(`/interview/user/${userId}`);
    return response.data;
  }
};

export default interviewService;
