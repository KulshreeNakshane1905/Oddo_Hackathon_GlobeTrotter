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
import usersRoutes from './users.routes';
import adminRoutes from './admin.routes';
import { tripShareRouter, publicTripRouter } from './sharing.routes';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/trips', tripsRoutes);
router.use('/cities', citiesRoutes);
router.use('/admin', adminRoutes);

// Phase 3 — Stops & Activities
router.use('/trips/:tripId/stops', stopsRoutes);        // POST /, PATCH /reorder
router.use('/stops', stopsDirectRoutes);                  // PUT /:id, DELETE /:id
router.use('/stops/:stopId/activities', stopActivitiesRouter); // POST /
router.use('/stop-activities', stopActivityDirectRouter);      // PUT /:id, DELETE /:id
router.use('/activities', activitySearchRouter);                // GET /search

// Phase 4 — Budget & Timeline
router.use('/trips/:id', budgetRoutes);                         // GET /budget, GET /timeline

// Phase 5 — Sharing & Profile
router.use('/trips/:id/share', tripShareRouter);                // POST /, DELETE /
router.use('/public/trip', publicTripRouter);                   // GET /:token, POST /:token/copy

// API Base Root Route
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the GlobalTrotters API',
    version: '1.0.0'
  });
});

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
