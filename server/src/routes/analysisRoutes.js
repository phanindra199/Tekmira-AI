import { Router } from 'express';
import {
  uploadResumePdf,
  createResumeRecord,
  getResumeRecord,
  saveRepositorySnapshot,
  getUserRepositories,
  createAnalysisReport,
  getAnalysisReport
} from '../controllers/analysisController.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createResumeSchema,
  saveRepositorySchema,
  createReportSchema
} from '../validations/analysisValidation.js';
import {
  handleResumeUpload,
  validateUploadedPdf
} from '../middleware/uploadMiddleware.js';

const router = Router();

// --- PDF Resume Upload & Stream Extraction ---
// Public / Semi-Authenticated Upload (associates with candidate if Bearer token is provided)
router.post(
  '/resumes/upload',
  optionalAuth,
  handleResumeUpload,
  validateUploadedPdf,
  uploadResumePdf
);

// Strictly Authenticated Resume Upload
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

// --- Repository Snapshot Routes ---
router.post('/repositories', validate(saveRepositorySchema), saveRepositorySnapshot);
router.get('/repositories/user/:userId', getUserRepositories);

// --- Skill Analysis Report Routes ---
router.post('/reports', validate(createReportSchema), createAnalysisReport);
router.get('/reports/:id', getAnalysisReport);

export default router;
