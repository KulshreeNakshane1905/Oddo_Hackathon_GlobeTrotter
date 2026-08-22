// ============================================================================
// Budget Controller — Handles HTTP requests for budget & timeline operations
// ============================================================================

import { Response, NextFunction } from 'express';
import { budgetService } from '../services/budget.service';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class BudgetController {
  /**
   * GET /api/trips/:id/budget — Compute and return full budget breakdown
   */
  async getBudget(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        ApiResponse.error(res, 401, 'Not authenticated', 'UNAUTHORIZED');
        return;
      }

      const tripId = req.params.id as string;
      const breakdown = await budgetService.computeBudget(tripId, req.userId);
      ApiResponse.success(res, breakdown);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/trips/:id/timeline — Flattened day-wise timeline for calendar
   */
  async getTimeline(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        ApiResponse.error(res, 401, 'Not authenticated', 'UNAUTHORIZED');
        return;
      }

      const tripId = req.params.id as string;
      const events = await budgetService.getTimeline(tripId, req.userId);
      ApiResponse.success(res, events);
    } catch (err) {
      next(err);
    }
  }
}

export const budgetController = new BudgetController();
