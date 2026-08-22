// ============================================================================
// Users Routes — Profile and saved cities endpoints
// ============================================================================

import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

// Profile
router.get('/me', (req, res, next) => usersController.getMe(req, res, next));
router.put('/me', (req, res, next) => usersController.updateMe(req, res, next));
router.delete('/me', (req, res, next) => usersController.deleteMe(req, res, next));

// Saved Cities
router.get('/me/saved-cities', (req, res, next) => usersController.getSavedCities(req, res, next));
router.post('/me/saved-cities', (req, res, next) => usersController.saveCity(req, res, next));
router.delete('/me/saved-cities/:cityId', (req, res, next) => usersController.unsaveCity(req, res, next));

export default router;
