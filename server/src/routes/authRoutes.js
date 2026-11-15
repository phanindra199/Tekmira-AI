import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validations/authValidation.js';

const router = Router();

// Public Authentication Endpoints with Zod Input Validation
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected Identity Verification Endpoint
router.get('/me', authenticate, getMe);

export default router;
