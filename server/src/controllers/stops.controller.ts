// ============================================================================
// Stops Controller — Handles HTTP requests for stop operations
// ============================================================================

import { Response, NextFunction } from 'express';
import { stopsService } from '../services/stops.service';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class StopsController {
  /**
   * POST /api/trips/:tripId/stops — Add a stop to a trip
   */
  async addStop(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        ApiResponse.error(res, 401, 'Not authenticated', 'UNAUTHORIZED');
        return;
      }

      const tripId = String(req.params.tripId);
      const stop = await stopsService.addStop(req.userId, tripId, req.body);
      ApiResponse.created(res, stop);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/stops/:id — Update a stop
   */
  async updateStop(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        ApiResponse.error(res, 401, 'Not authenticated', 'UNAUTHORIZED');
        return;
      }

      const stopId = String(req.params.id);
      const stop = await stopsService.updateStop(req.userId, stopId, req.body);
      ApiResponse.success(res, stop);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/stops/:id — Delete a stop
   */
  async deleteStop(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        ApiResponse.error(res, 401, 'Not authenticated', 'UNAUTHORIZED');
        return;
      }

      const stopId = String(req.params.id);
      await stopsService.deleteStop(req.userId, stopId);
      ApiResponse.noContent(res);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/trips/:tripId/stops/reorder — Batch reorder stops
   */
  async reorderStops(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        ApiResponse.error(res, 401, 'Not authenticated', 'UNAUTHORIZED');
        return;
      }

      const tripId = String(req.params.tripId);
      const { orderedIds } = req.body;
      const stops = await stopsService.reorderStops(req.userId, tripId, orderedIds);
      ApiResponse.success(res, stops);
    } catch (err) {
      next(err);
    }
  }
}

export const stopsController = new StopsController();
