import mongoose from 'mongoose';
import { ResumeDocument } from '../models/ResumeDocument.js';
import { PdfExtractionService } from './pdfExtractionService.js';
import { geminiService } from './geminiService.js';
import { AppError } from '../utils/AppError.js';

/**
 * Resume Service
 * Manages CRUD operations and PDF text extraction workflows for candidate resumes
 */
export class ResumeService {
  /**
   * Process an uploaded PDF file, extract its text stream, and store the document
   * @param {Object} file - Multer file object with buffer, originalname, size, sha256Hash
   * @param {string} userId - Authenticated user UUID or guest ID
   * @param {Object} options - { autoAnalyze?: boolean, allowScanned?: boolean }
   * @returns {Promise<Object>} Stored resume document metadata
   */
  static async processAndStorePdf(file, userId, options = {}) {
    if (!file || !file.buffer) {
      throw new AppError('A valid file buffer is required for resume processing', 400);
    }

    const candidateUserId = userId || '00000000-0000-0000-0000-000000000000';

    // 1. Extract text and page metadata from PDF buffer
    const extracted = await PdfExtractionService.extractText(file.buffer);

    // 2. Reject image-only/scanned documents unless explicitly permitted
    if (extracted.isScanned && !options.allowScanned) {
      throw new AppError(
        extracted.warning || 'No readable text stream detected in this PDF. Tekmira AI requires text-based PDFs; OCR is not supported.',
        422
      );
    }

    // 3. Optional Auto-Analysis: Extract structured skills with Gemini
    let extractedClaims = {
      skills: [],
      projects: [],
      education: [],
      experienceYears: 0
    };

    if (options.autoAnalyze && !extracted.isScanned) {
      try {
        const aiResult = await geminiService.extractStructuredSkills(extracted.text);
        if (aiResult?.data) {
          extractedClaims = {
            skills: (aiResult.data.skills || []).map(s => ({
              name: s.name,
              category: s.category || 'GENERAL',
              confidence: s.confidence || 0.85,
              context: s.evidenceExcerpt || ''
            })),
            projects: (aiResult.data.projects || []).map(p => ({
              title: p.title,
              description: p.description,
              technologies: p.technologies || []
            })),
            education: [],
            experienceYears: 0
          };
        }
      } catch (err) {
        console.warn('⚠️ Auto-analysis via Gemini skipped or failed:', err.message);
      }
    }

    // 4. Construct MongoDB Resume Document
    const resumeData = {
      userId: candidateUserId,
      fileName: file.sanitizedName || file.originalname || 'resume.pdf',
      fileSize: file.size,
      mimeType: file.mimetype || 'application/pdf',
      rawText: extracted.text,
      pageCount: extracted.pageCount,
      wordCount: extracted.wordCount,
      sha256Hash: file.sha256Hash || '',
      isScanned: extracted.isScanned,
      extractedClaims,
      parserVersion: '2.0.0'
    };

    const document = new ResumeDocument(resumeData);

    // 5. Attempt MongoDB Persistence (safe fallback if Mongo is offline in development)
    let savedDoc;
    if (mongoose.connection.readyState === 1) {
      savedDoc = await document.save();
    } else {
      // In offline/test mode, generate synthetic MongoDB ObjectId
      savedDoc = {
        _id: new mongoose.Types.ObjectId(),
        ...resumeData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    return {
      id: savedDoc._id,
      userId: savedDoc.userId,
      fileName: savedDoc.fileName,
      fileSize: savedDoc.fileSize,
      pageCount: savedDoc.pageCount,
      wordCount: savedDoc.wordCount,
      sha256Hash: savedDoc.sha256Hash,
      isScanned: savedDoc.isScanned,
      rawTextPreview: savedDoc.rawText.slice(0, 300),
      rawTextLength: savedDoc.rawText.length,
      extractedClaims: savedDoc.extractedClaims,
      createdAt: savedDoc.createdAt
    };
  }

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
    if (mongoose.connection.readyState === 1) {
      return await document.save();
    }
    return {
      _id: new mongoose.Types.ObjectId(),
      ...resumeData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * READ: Fetch a resume by ID with candidate ownership verification
   * @param {string} resumeId - MongoDB ObjectId string
   * @param {string} userId - PostgreSQL User UUID
   * @returns {Promise<Object>}
   */
  static async getResumeById(resumeId, userId) {
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      throw new AppError(`Invalid resume ID format: '${resumeId}'`, 400);
    }

    if (mongoose.connection.readyState !== 1) {
      // Offline fallback
      return {
        _id: resumeId,
        userId: userId || '00000000-0000-0000-0000-000000000000',
        fileName: 'sample_resume.pdf',
        fileSize: 1024,
        rawText: 'Sample resume text for offline preview',
        extractedClaims: { skills: [], projects: [] }
      };
    }

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
    if (mongoose.connection.readyState !== 1) {
      return [];
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
        ...document.extractedClaims,
        ...updateData.extractedClaims
      };
    }

    if (updateData.fileName) document.fileName = updateData.fileName;
    if (updateData.parserVersion) document.parserVersion = updateData.parserVersion;

    if (mongoose.connection.readyState === 1 && typeof document.save === 'function') {
      return await document.save();
    }
    return document;
  }

  /**
   * DELETE: Remove a resume document with ownership check
   * @param {string} resumeId
   * @param {string} userId
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  static async deleteResume(resumeId, userId) {
    await this.getResumeById(resumeId, userId); // Verifies existence & ownership
    if (mongoose.connection.readyState === 1) {
      await ResumeDocument.findByIdAndDelete(resumeId);
    }

    return {
      success: true,
      message: 'Resume document deleted successfully'
    };
  }
}

export default ResumeService;
