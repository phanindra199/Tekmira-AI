import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validations/authValidation.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public Authentication Endpoints with Zod Input Validation & Brute-Force Rate Limiting
router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);

// Protected Identity Verification Endpoint
router.get('/me', authenticate, getMe);

export default router;
