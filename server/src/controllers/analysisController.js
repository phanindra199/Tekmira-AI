import { ResumeService } from '../services/resumeService.js';
import { RepositoryService } from '../services/repositoryService.js';
import { AnalysisReportService } from '../services/analysisReportService.js';
import { MatchingEngineService } from '../services/matchingEngineService.js';
import { AppError } from '../utils/AppError.js';

/**
 * Analysis & Document Store Controller
 * Dispatches requests for candidate resumes, repository snapshots, and triangulation reports
 */

// --- Resume Document Handlers ---
export const uploadResumePdf = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'] || req.body?.userId;
    const autoAnalyze = req.query?.autoAnalyze === 'true' || req.body?.autoAnalyze === 'true';
    const allowScanned = req.query?.allowScanned === 'true' || req.body?.allowScanned === 'true';

    const result = await ResumeService.processAndStorePdf(req.file, userId, {
      autoAnalyze,
      allowScanned
    });

    return res.status(201).json({
      success: true,
      message: 'Resume PDF uploaded and parsed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const createResumeRecord = async (req, res, next) => {
  try {
    const resume = await ResumeService.createResume(req.body);
    return res.status(201).json({
      success: true,
      message: 'Resume record created successfully',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeRecord = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    const resume = await ResumeService.getResumeById(req.params.id, userId);
    return res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// --- Repository Snapshot Handlers ---
export const fetchRepositoryEvidenceHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'] || req.body?.userId;
    const { repoUrl, candidateEmail, bypassCache } = req.body;

    if (!repoUrl) {
      throw new AppError('repoUrl is required in request body', 400);
    }

    const snapshot = await RepositoryService.fetchAndPersistRepository(repoUrl, userId, {
      candidateEmail,
      bypassCache
    });

    return res.status(200).json({
      success: true,
      message: 'Repository evidence successfully mined and persisted',
      data: snapshot
    });
  } catch (error) {
    next(error);
  }
};

export const saveRepositorySnapshot = async (req, res, next) => {
  try {
    const snapshot = await RepositoryService.upsertRepositorySnapshot(req.body);
    return res.status(200).json({
      success: true,
      message: 'Repository snapshot stored successfully',
      data: snapshot
    });
  } catch (error) {
    next(error);
  }
};

export const getUserRepositories = async (req, res, next) => {
  try {
    const repos = await RepositoryService.getUserRepositories(req.params.userId);
    return res.status(200).json({
      success: true,
      count: repos.length,
      data: repos
    });
  } catch (error) {
    next(error);
  }
};

// --- Skill Analysis & Triangulation Report Handlers ---
export const triangulateSkillsHandler = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.headers['x-user-id'] || req.body?.userId || '00000000-0000-0000-0000-000000000000';
    const { resumeId, repositoryId, jobId, claimedSkills, repoSnapshot, targetJob } = req.body;

    // Direct in-memory calculation if raw objects provided
    if (claimedSkills || repoSnapshot) {
      const result = MatchingEngineService.triangulateSkills({
        claimedSkills: claimedSkills || [],
        repoSnapshot: repoSnapshot || {},
        targetJob
      });
      return res.status(200).json({
        success: true,
        message: '3-way skill evidence triangulation completed',
        data: result
      });
    }

    // Persisted report workflow
    const report = await MatchingEngineService.generateReport({
      userId,
      resumeId,
      repositoryId,
      jobId
    });

    return res.status(201).json({
      success: true,
      message: 'Triangulation report generated and stored successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

export const createAnalysisReport = async (req, res, next) => {
  try {
    const report = await AnalysisReportService.createReport(req.body);
    return res.status(201).json({
      success: true,
      message: 'Skill analysis report stored successfully',
      data: report
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalysisReport = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.query.userId;
    const report = await AnalysisReportService.getReportById(req.params.id, userId);
    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

export const getUserReportsHandler = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user?.id;
    const reports = await AnalysisReportService.getUserReports(userId);
    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

export default {
  uploadResumePdf,
  createResumeRecord,
  getResumeRecord,
  fetchRepositoryEvidenceHandler,
  saveRepositorySnapshot,
  getUserRepositories,
  triangulateSkillsHandler,
  createAnalysisReport,
  getAnalysisReport,
  getUserReportsHandler
};
