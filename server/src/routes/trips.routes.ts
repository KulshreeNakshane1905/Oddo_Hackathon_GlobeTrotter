// ============================================================================
// Trip Routes — /api/trips/*
// ============================================================================

import { Router } from 'express';
import { tripsController } from '../controllers/trips.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  createTripSchema,
  updateTripSchema,
  tripQuerySchema,
} from '../validators/trips.validators';

const router = Router();

// All trip routes require authentication
router.use(authMiddleware);

// CRUD endpoints
router.post('/', validate(createTripSchema), tripsController.createTrip);
router.get('/', validate(tripQuerySchema, 'query'), tripsController.getTrips);
router.get('/:id', tripsController.getTripById);
router.put('/:id', validate(updateTripSchema), tripsController.updateTrip);
router.delete('/:id', tripsController.deleteTrip);

export default router;
