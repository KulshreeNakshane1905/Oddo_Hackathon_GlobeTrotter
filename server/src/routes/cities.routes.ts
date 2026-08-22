// ============================================================================
// City Routes — /api/cities/*
// ============================================================================

import { Router } from 'express';
import { citiesController } from '../controllers/cities.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public — no auth required
router.get('/popular', citiesController.getPopularCities);

// Protected — requires authentication
router.get('/search', authMiddleware, citiesController.searchCities);

export default router;
