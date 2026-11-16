import { Router } from 'express';
import {
  createSessionHandler,
  evaluateAnswerHandler,
  getSessionHandler,
  getUserSessionsHandler
} from '../controllers/interviewController.js';
import { getInterviewAnalytics } from '../controllers/analyticsController.js';
import { optionalAuth, authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createInterviewSessionSchema,
  evaluateAnswerSchema
} from '../validations/interviewValidation.js';

const router = Router();

// Create new grounded viva session (optionalAuth allows guest demos)
router.post('/sessions', optionalAuth, validate(createInterviewSessionSchema), createSessionHandler);

// Submit student answer for rubric evaluation
router.post('/sessions/:sessionId/evaluate', optionalAuth, validate(evaluateAnswerSchema), evaluateAnswerHandler);

// Retrieve session details & history
router.get('/sessions/:id', optionalAuth, getSessionHandler);
router.get('/user/:userId', optionalAuth, getUserSessionsHandler);

// Aggregated Viva Voce Analytics (Day 18)
router.get('/analytics/summary', getInterviewAnalytics);

export default router;
