import { ResumeDocument } from '../models/ResumeDocument.js';
import { AppError } from '../utils/AppError.js';

/**
 * Resume Service
 * Manages CRUD operations for unstructured candidate resume records in MongoDB
 */
export class ResumeService {
  /**
   * CREATE: Store a newly parsed resume document
   * @param {Object} resumeData
   * @returns {Promise<Object>} Created Resume Document
   */
  static async createResume(resumeData) {
    if (!resumeData.userId) {
      throw new AppError('Candidate user identifier is required', 400);
    }
    if (!resumeData.rawText) {
      throw new AppError('Resume raw text cannot be empty', 400);
    }

    const document = new ResumeDocument(resumeData);
    return await document.save();
  }

  /**
   * READ: Fetch a resume by ID with candidate ownership verification
   * @param {string} resumeId - MongoDB ObjectId string
   * @param {string} userId - PostgreSQL User UUID
   * @returns {Promise<Object>}
   */
  static async getResumeById(resumeId, userId) {
    const document = await ResumeDocument.findById(resumeId);
    if (!document) {
      throw new AppError('Resume document not found', 404);
    }

    // Ownership check: prevent candidates from accessing other candidates' resumes
    if (userId && document.userId !== userId) {
      throw new AppError('Access denied: Unauthorized to view this resume', 403);
    }

    return document;
  }

  /**
   * READ: Fetch all resumes uploaded by a specific candidate
   * @param {string} userId - PostgreSQL User UUID
   * @returns {Promise<Array>}
   */
  static async getUserResumes(userId) {
    if (!userId) {
      throw new AppError('Candidate user identifier is required', 400);
    }
    return await ResumeDocument.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * UPDATE: Modify extracted claims or metadata for an existing resume
   * @param {string} resumeId
   * @param {string} userId
   * @param {Object} updateData
   * @returns {Promise<Object>} Updated Document
   */
  static async updateResumeClaims(resumeId, userId, updateData) {
    const document = await this.getResumeById(resumeId, userId);

    if (updateData.extractedClaims) {
      document.extractedClaims = {
        ...document.extractedClaims.toObject(),
        ...updateData.extractedClaims
      };
    }

    if (updateData.fileName) document.fileName = updateData.fileName;
    if (updateData.parserVersion) document.parserVersion = updateData.parserVersion;

    return await document.save();
  }

  /**
   * DELETE: Remove a resume document with ownership check
   * @param {string} resumeId
   * @param {string} userId
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  static async deleteResume(resumeId, userId) {
    await this.getResumeById(resumeId, userId); // Verifies existence & ownership
    await ResumeDocument.findByIdAndDelete(resumeId);

    return {
      success: true,
      message: 'Resume document deleted successfully'
    };
  }
}

export default ResumeService;
