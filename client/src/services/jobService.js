import apiClient from './apiClient';

export const jobService = {
  /**
   * Fetch all benchmark campus job roles
   * @param {object} [options]
   * @param {AbortSignal} [options.signal]
   */
  async getJobs({ signal } = {}) {
    const response = await apiClient.get('/jobs', { signal });
    return response.data || [];
  },

  /**
   * Fetch a single job role by ID
   */
  async getJobById(jobId) {
    const response = await apiClient.get(`/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Bookmark / save a job for current candidate
   */
  async saveJob(jobId) {
    const response = await apiClient.post(`/jobs/save/${jobId}`);
    return response.data;
  }
};

export default jobService;
