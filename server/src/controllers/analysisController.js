import { ResumeService } from '../services/resumeService.js';
import { RepositoryService } from '../services/repositoryService.js';
import { AnalysisReportService } from '../services/analysisReportService.js';

/**
 * Analysis & Document Store Controller
 * Dispatches requests for candidate resumes, repository snapshots, and triangulation reports
 */

// --- Resume Document Handlers ---
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

// --- Skill Analysis Report Handlers ---
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

export default {
  createResumeRecord,
  getResumeRecord,
  saveRepositorySnapshot,
  getUserRepositories,
  createAnalysisReport,
  getAnalysisReport
};
