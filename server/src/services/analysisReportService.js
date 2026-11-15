import { SkillAnalysisReport } from '../models/SkillAnalysisReport.js';
import { AppError } from '../utils/AppError.js';

/**
 * Skill Analysis Report Service
 * Manages storage and retrieval of Gemini 3-way triangulation reports
 */
export class AnalysisReportService {
  /**
   * CREATE: Store a newly generated skill analysis report
   * @param {Object} reportData
   * @returns {Promise<Object>} Created Report Document
   */
  static async createReport(reportData) {
    if (!reportData.userId || !reportData.jobId) {
      throw new AppError('userId and jobId are mandatory for analysis reports', 400);
    }
    if (typeof reportData.overallReadinessScore !== 'number') {
      throw new AppError('Valid numerical overallReadinessScore (0-100) is required', 400);
    }

    const report = new SkillAnalysisReport(reportData);
    return await report.save();
  }

  /**
   * READ: Fetch a report by ID with populated resume metadata and ownership check
   * @param {string} reportId
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  static async getReportById(reportId, userId) {
    const report = await SkillAnalysisReport.findById(reportId).populate('resumeId', 'fileName fileSize createdAt');
    if (!report) {
      throw new AppError('Skill analysis report not found', 404);
    }

    if (userId && report.userId !== userId) {
      throw new AppError('Access denied: Unauthorized to view this report', 403);
    }

    return report;
  }

  /**
   * READ: Fetch all reports generated for a candidate
   * @param {string} userId
   * @returns {Promise<Array>}
   */
  static async getUserReports(userId) {
    if (!userId) {
      throw new AppError('Candidate user identifier is required', 400);
    }
    return await SkillAnalysisReport.find({ userId })
      .select('-triangulationMatrix.evidence') // Lightweight projection for list views
      .sort({ createdAt: -1 });
  }

  /**
   * UPDATE: Update report status or remediation progress
   * @param {string} reportId
   * @param {string} userId
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  static async updateReportStatus(reportId, userId, updateData) {
    const report = await this.getReportById(reportId, userId);

    if (updateData.status) report.status = updateData.status;
    if (updateData.remediationPlan) report.remediationPlan = updateData.remediationPlan;

    return await report.save();
  }
}

export default AnalysisReportService;
