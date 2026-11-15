import apiClient from './apiClient';

export const repositoryService = {
  /**
   * Mine repository evidence from GitHub REST API
   * 
   * @param {string} repoUrl - Public GitHub URL
   * @param {string} [candidateEmail] - Optional candidate email to verify commit authorship
   * @param {boolean} [bypassCache] - Whether to bypass 5-minute memory cache
   * @returns {Promise<object>} Repository snapshot data
   */
  async fetchRepositoryEvidence(repoUrl, candidateEmail = '', bypassCache = false) {
    const response = await apiClient.post('/analysis/repositories/fetch', {
      repoUrl,
      candidateEmail,
      bypassCache
    });
    return response.data;
  },

  /**
   * Execute 3-way skill evidence triangulation between Resume, Repo, and Job
   * 
   * @param {object} params - { resumeId?, repositoryId?, jobId?, claimedSkills?, repoSnapshot?, targetJob? }
   * @returns {Promise<object>} Triangulation analysis or persisted report
   */
  async triangulateSkills(params = {}) {
    const response = await apiClient.post('/analysis/triangulate', params);
    return response.data;
  },

  /**
   * Fetch a specific skill analysis report by ID
   * 
   * @param {string} reportId 
   * @returns {Promise<object>} Report object
   */
  async getReportById(reportId) {
    const response = await apiClient.get(`/analysis/reports/${reportId}`);
    return response.data;
  },

  /**
   * Fetch all reports generated for candidate
   * 
   * @param {string} userId 
   * @returns {Promise<object>} Reports list
   */
  async getUserReports(userId) {
    const response = await apiClient.get(`/analysis/reports/user/${userId}`);
    return response.data;
  }
};

export default repositoryService;
