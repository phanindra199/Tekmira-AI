import apiClient from './apiClient';

export const SAMPLE_CANDIDATE_RESUME = `
Priya Sharma | Computer Science & Engineering
Email: priya.sharma@example.edu | GitHub: github.com/priyasharma-dev

TECHNICAL SKILLS:
- Languages: JavaScript (ES6+), TypeScript, Python, SQL
- Frontend: React 18, Tailwind CSS, HTML5, CSS3, Vite
- Backend & Databases: Node.js, Express.js, PostgreSQL, MongoDB, Prisma ORM, Mongoose
- Core Tools & Platforms: Git, GitHub, RESTful APIs, JWT Authentication, Docker, Postman

ACADEMIC & CAPSTONE PROJECTS:
1. Campus Placement Evidence Portal (Tekmira AI)
   - Built with React, Node.js, Express, PostgreSQL, and MongoDB.
   - Designed normalized Prisma schemas for student job applications.
   - Implemented stateless JWT authentication and role-based access control.
   - Integrated Google Gemini AI for automated resume skill claim analysis.

2. Distributed Task Queue & Real-Time Notification System
   - Implemented an asynchronous task pipeline in Node.js using Redis message queues.
   - Managed background email dispatching and webhook callbacks with 99.8% uptime.

EDUCATION:
- B.Tech in Computer Science and Engineering (2022 - 2026) | CGPA: 8.8/10
`.trim();

export const aiService = {
  /**
   * Upload and extract text stream from a candidate PDF resume.
   *
   * @param {File} file - PDF file object from browser file input
   * @param {object} [options] - { autoAnalyze?: boolean, allowScanned?: boolean }
   * @returns {Promise<object>} Parsed PDF metadata and text stream
   */
  async uploadResumePdf(file, options = {}) {
    const formData = new FormData();
    formData.append('resume', file);

    const queryParams = new URLSearchParams();
    if (options.autoAnalyze) queryParams.append('autoAnalyze', 'true');
    if (options.allowScanned) queryParams.append('allowScanned', 'true');

    const url = `/analysis/resumes/upload${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Analyze candidate resume text via backend Gemini API service.
   *
   * @param {string} resumeText
   * @param {object} [options]
   * @returns {Promise<object>} Analysis response payload
   */
  async analyzeResume(resumeText, options = {}) {
    const response = await apiClient.post('/ai/analyze-resume', {
      resumeText,
      ...options
    });
    return response.data;
  },

  /**
   * Extract structured schema-validated skills and project evidence.
   *
   * @param {string} resumeText
   * @param {object} [options]
   * @returns {Promise<object>} Structured analysis payload
   */
  async extractStructuredSkills(resumeText, options = {}) {
    const response = await apiClient.post('/ai/extract-skills', {
      resumeText,
      ...options
    });
    return response.data;
  },

  /**
   * Safe status check of backend Gemini service.
   *
   * @returns {Promise<object>} Status metadata
   */
  async getAiStatus() {
    const response = await apiClient.get('/ai/status');
    return response.data;
  }
};

export default aiService;
