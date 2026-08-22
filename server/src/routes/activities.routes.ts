// ============================================================================
// Activity Routes — /api/stops/:stopId/activities/* and /api/stop-activities/*
//                   and /api/activities/search
// ============================================================================

import { Router } from 'express';
import { activitiesController } from '../controllers/activities.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  addActivitySchema,
  updateStopActivitySchema,
  activitySearchSchema,
} from '../validators/activities.validators';

// ── Stop-scoped activity routes (/api/stops/:stopId/activities) ──────────────
export const stopActivitiesRouter = Router({ mergeParams: true });
stopActivitiesRouter.use(authMiddleware);
stopActivitiesRouter.post('/', validate(addActivitySchema), activitiesController.addActivity);

// ── Direct stop-activity routes (/api/stop-activities/:id) ───────────────────
export const stopActivityDirectRouter = Router();
stopActivityDirectRouter.use(authMiddleware);
stopActivityDirectRouter.put(
  '/:id',
  validate(updateStopActivitySchema),
  activitiesController.updateActivity
);
stopActivityDirectRouter.delete('/:id', activitiesController.removeActivity);

// ── Activity search route (/api/activities/search) ───────────────────────────
export const activitySearchRouter = Router();
activitySearchRouter.use(authMiddleware);
activitySearchRouter.get(
  '/search',
  validate(activitySearchSchema, 'query'),
  activitiesController.searchActivities
);
