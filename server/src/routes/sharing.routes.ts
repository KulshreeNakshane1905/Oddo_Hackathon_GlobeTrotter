// ============================================================================
// Sharing Routes — Endpoints for sharing trips
// ============================================================================

import { Router } from 'express';
import { sharingController } from '../controllers/sharing.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// 1. Routes that modify a trip's share status (need auth)
// These routes are mounted under /api/trips/:id/share in the main router, 
// so this router expects `id` in params from the parent router (using mergeParams)
// Actually, let's just define them here and mount them properly in index.ts

export const tripShareRouter = Router({ mergeParams: true });
tripShareRouter.post('/', authMiddleware, (req, res, next) => sharingController.shareTrip(req, res, next));
tripShareRouter.delete('/', authMiddleware, (req, res, next) => sharingController.unshareTrip(req, res, next));

// 2. Routes for accessing a public trip (under /api/public/trip)
export const publicTripRouter = Router();
publicTripRouter.get('/:token', (req, res, next) => sharingController.getPublicTrip(req, res, next));
publicTripRouter.post('/:token/copy', authMiddleware, (req, res, next) => sharingController.copyTrip(req, res, next));
