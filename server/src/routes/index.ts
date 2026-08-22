// ============================================================================
// Route Aggregator — Mounts all route modules
// ============================================================================

import { Router } from 'express';
import authRoutes from './auth.routes';
import tripsRoutes from './trips.routes';
import citiesRoutes from './cities.routes';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/trips', tripsRoutes);
router.use('/cities', citiesRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

export default router;
