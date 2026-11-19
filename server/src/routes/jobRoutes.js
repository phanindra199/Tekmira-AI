import { Router } from 'express';
import { getJobs, getJobById, saveJob, applyToJob, getMyApplications } from '../controllers/jobController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Candidate Benchmark Job Endpoints
router.get('/', getJobs);
router.get('/applications/me', authenticate, getMyApplications);
router.get('/:id', getJobById);
router.post('/apply/:jobId', authenticate, applyToJob);

// Protected Save Job Endpoint
router.post('/save/:jobId', authenticate, saveJob);

export default router;
