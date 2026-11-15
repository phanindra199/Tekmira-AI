import { Router } from 'express';
import { getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// Protected user profile endpoint: GET /api/users/me
router.get('/me', authenticate, getMe);

export default router;
