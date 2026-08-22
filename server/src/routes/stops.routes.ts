// ============================================================================
// Stop Routes — /api/trips/:tripId/stops/* and /api/stops/*
// ============================================================================

import { Router } from 'express';
import { stopsController } from '../controllers/stops.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  createStopSchema,
  updateStopSchema,
  reorderStopsSchema,
} from '../validators/stops.validators';

const router = Router({ mergeParams: true }); // mergeParams to access :tripId

// All stop routes require authentication
router.use(authMiddleware);

// ── Trip-scoped stop routes (/api/trips/:tripId/stops) ───────────────────────
router.post('/', validate(createStopSchema), stopsController.addStop);
router.patch('/reorder', validate(reorderStopsSchema), stopsController.reorderStops);

export default router;
