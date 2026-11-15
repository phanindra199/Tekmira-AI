import { Router } from 'express';
import {
  createResumeRecord,
  getResumeRecord,
  saveRepositorySnapshot,
  getUserRepositories,
  createAnalysisReport,
  getAnalysisReport
} from '../controllers/analysisController.js';

const router = Router();

// Resume Document Routes
router.post('/resumes', createResumeRecord);
router.get('/resumes/:id', getResumeRecord);

// Repository Snapshot Routes
router.post('/repositories', saveRepositorySnapshot);
router.get('/repositories/user/:userId', getUserRepositories);

// Skill Analysis Report Routes
router.post('/reports', createAnalysisReport);
router.get('/reports/:id', getAnalysisReport);

export default router;
