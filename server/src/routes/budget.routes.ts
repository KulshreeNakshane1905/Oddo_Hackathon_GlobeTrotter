// ============================================================================
// Budget Routes — Budget breakdown and timeline endpoints
// ============================================================================

import { Router } from 'express';
import { budgetController } from '../controllers/budget.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true }); // mergeParams to access :id from parent

// All budget routes require authentication
router.use(authMiddleware);

// GET /api/trips/:id/budget — Full budget breakdown with charts data
router.get('/budget', (req, res, next) => budgetController.getBudget(req, res, next));

// GET /api/trips/:id/timeline — Flattened timeline events for calendar
router.get('/timeline', (req, res, next) => budgetController.getTimeline(req, res, next));

export default router;
