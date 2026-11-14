import { Router } from 'express';
import healthRoutes from './healthRoutes.js';

const router = Router();

// Mount sub-routers
router.use('/', healthRoutes);

export default router;
