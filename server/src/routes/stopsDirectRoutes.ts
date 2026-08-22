// ============================================================================
// Stop Direct Routes — /api/stops/:id (update, delete individual stops)
// ============================================================================

import { Router } from 'express';
import { stopsController } from '../controllers/stops.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { updateStopSchema } from '../validators/stops.validators';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ── Individual stop operations ───────────────────────────────────────────────
router.put('/:id', validate(updateStopSchema), stopsController.updateStop);
router.delete('/:id', stopsController.deleteStop);

export default router;
