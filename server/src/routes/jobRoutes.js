import { Router } from 'express';
import { getJobs, getJobById, saveJob } from '../controllers/jobController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Candidate Benchmark Job Endpoints
router.get('/', getJobs);
router.get('/:id', getJobById);

// Protected Save Job Endpoint
router.post('/save/:jobId', authenticate, saveJob);

export default router;
