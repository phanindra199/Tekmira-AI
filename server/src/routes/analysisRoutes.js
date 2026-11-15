import { Router } from 'express';
import {
  createResumeRecord,
  getResumeRecord,
  saveRepositorySnapshot,
  getUserRepositories,
  createAnalysisReport,
  getAnalysisReport
} from '../controllers/analysisController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createResumeSchema,
  saveRepositorySchema,
  createReportSchema
} from '../validations/analysisValidation.js';

const router = Router();

// Resume Document Routes with Zod validation
router.post('/resumes', validate(createResumeSchema), createResumeRecord);
router.get('/resumes/:id', getResumeRecord);

// Repository Snapshot Routes with Zod validation
router.post('/repositories', validate(saveRepositorySchema), saveRepositorySnapshot);
router.get('/repositories/user/:userId', getUserRepositories);

// Skill Analysis Report Routes with Zod validation
router.post('/reports', validate(createReportSchema), createAnalysisReport);
router.get('/reports/:id', getAnalysisReport);

export default router;
