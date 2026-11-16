import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import jobRoutes from './jobRoutes.js';
import analysisRoutes from './analysisRoutes.js';
import aiRoutes from './aiRoutes.js';
import interviewRoutes from './interviewRoutes.js';

const router = Router();

// Base System Health Check
router.use('/', healthRoutes);

// --- Version 1 API Routes (/api/v1/...) ---
const v1Router = Router();
v1Router.use('/', healthRoutes);
v1Router.use('/auth', authRoutes);
v1Router.use('/users', userRoutes);
v1Router.use('/jobs', jobRoutes);
v1Router.use('/analysis', analysisRoutes);
v1Router.use('/ai', aiRoutes);
v1Router.use('/interview', interviewRoutes);

router.use('/v1', v1Router);

// --- Backward-Compatible Top-Level Aliases (/api/...) ---
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/jobs', jobRoutes);
router.use('/analysis', analysisRoutes);
router.use('/ai', aiRoutes);
router.use('/interview', interviewRoutes);

export default router;
