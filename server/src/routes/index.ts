// ============================================================================
// Route Aggregator — Mounts all route modules
// ============================================================================

import { Router } from 'express';
import authRoutes from './auth.routes';
import tripsRoutes from './trips.routes';
import citiesRoutes from './cities.routes';
import stopsRoutes from './stops.routes';
import stopsDirectRoutes from './stopsDirectRoutes';
import {
  stopActivitiesRouter,
  stopActivityDirectRouter,
  activitySearchRouter,
} from './activities.routes';
import budgetRoutes from './budget.routes';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/trips', tripsRoutes);
router.use('/cities', citiesRoutes);

// Phase 3 — Stops & Activities
router.use('/trips/:tripId/stops', stopsRoutes);        // POST /, PATCH /reorder
router.use('/stops', stopsDirectRoutes);                  // PUT /:id, DELETE /:id
router.use('/stops/:stopId/activities', stopActivitiesRouter); // POST /
router.use('/stop-activities', stopActivityDirectRouter);      // PUT /:id, DELETE /:id
router.use('/activities', activitySearchRouter);                // GET /search

// Phase 4 — Budget & Timeline
router.use('/trips/:id', budgetRoutes);                         // GET /budget, GET /timeline

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
