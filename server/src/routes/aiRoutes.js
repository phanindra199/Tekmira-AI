import { Router } from 'express';
import AiController from '../controllers/aiController.js';
import { validate } from '../middleware/validate.js';
import { analyzeResumeSchema } from '../validations/aiValidation.js';

const router = Router();

// GET /api/ai/status - Safe status check
router.get('/status', AiController.getStatus);

// POST /api/ai/analyze-resume - Analyze candidate resume text with Gemini
router.post('/analyze-resume', validate(analyzeResumeSchema), AiController.analyzeResume);

// POST /api/ai/extract-skills - Extract structured schema-validated skills and project evidence
router.post('/extract-skills', validate(analyzeResumeSchema), AiController.extractSkills);

export default router;
