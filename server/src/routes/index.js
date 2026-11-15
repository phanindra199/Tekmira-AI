import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import analysisRoutes from './analysisRoutes.js';

const router = Router();

// Mount sub-routers
router.use('/', healthRoutes);
router.use('/analysis', analysisRoutes);

export default router;
