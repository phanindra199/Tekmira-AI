import { Router } from 'express';
import {
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
} from '../controllers/analysisController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createResumeSchema,
  saveRepositorySchema,
  createReportSchema,
  fetchRepositoryEvidenceSchema,
  triangulateSkillsSchema
} from '../validations/analysisValidation.js';
import {
  getCohortAnalytics,
  getCandidateTrajectory
} from '../controllers/analyticsController.js';
import {
  handleResumeUpload,
  validateUploadedPdf
} from '../middleware/uploadMiddleware.js';

const router = Router();

// --- PDF Resume Upload & Stream Extraction ---
router.post(
  '/resumes/upload',
  optionalAuth,
  handleResumeUpload,
  validateUploadedPdf,
  uploadResumePdf
);

router.post(
  '/resumes/upload-authenticated',
  authenticate,
  handleResumeUpload,
  validateUploadedPdf,
  uploadResumePdf
);

// --- Resume Document JSON Routes ---
router.post('/resumes', validate(createResumeSchema), createResumeRecord);
router.get('/resumes/:id', getResumeRecord);

// --- GitHub Repository Mining & Snapshots ---
router.post('/repositories/fetch', optionalAuth, validate(fetchRepositoryEvidenceSchema), fetchRepositoryEvidenceHandler);
router.post('/repositories', validate(saveRepositorySchema), saveRepositorySnapshot);
router.get('/repositories/user/:userId', getUserRepositories);

// --- 3-Way Skill Evidence Triangulation & Reports ---
router.post('/triangulate', optionalAuth, validate(triangulateSkillsSchema), triangulateSkillsHandler);
router.post('/reports', validate(createReportSchema), createAnalysisReport);
router.get('/reports/user/:userId', getUserReportsHandler);
router.get('/reports/:id', getAnalysisReport);

// --- MongoDB Analytics Aggregation Endpoints (Day 18) ---
router.get('/analytics/cohort', getCohortAnalytics);
router.get('/analytics/trajectory/:userId?', optionalAuth, getCandidateTrajectory);

export default router;
