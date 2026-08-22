// ============================================================================
// Activities Controller — Handles HTTP requests for activity operations
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { activitiesService } from '../services/activities.service';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import type { ActivityType } from '@prisma/client';

export class ActivitiesController {
  /**
   * POST /api/stops/:stopId/activities — Add an activity to a stop
   */
  async addActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        ApiResponse.error(res, 401, 'Not authenticated', 'UNAUTHORIZED');
        return;
      }

      const stopId = req.params.stopId;
      const stopActivity = await activitiesService.addActivityToStop(req.userId, stopId, req.body);
      ApiResponse.created(res, stopActivity);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/stop-activities/:id — Update a stop activity
   */
  async updateActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        ApiResponse.error(res, 401, 'Not authenticated', 'UNAUTHORIZED');
        return;
      }

      const stopActivityId = req.params.id;
      const stopActivity = await activitiesService.updateStopActivity(
        req.userId,
        stopActivityId,
        req.body
      );
      ApiResponse.success(res, stopActivity);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/stop-activities/:id — Remove an activity from a stop
   */
  async removeActivity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        ApiResponse.error(res, 401, 'Not authenticated', 'UNAUTHORIZED');
        return;
      }

      const stopActivityId = req.params.id;
      await activitiesService.removeStopActivity(req.userId, stopActivityId);
      ApiResponse.noContent(res);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/activities/search — Search activities with filters
   */
  async searchActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, type, cityId, maxCost, maxDuration, limit } = req.query as {
        q: string;
        type?: ActivityType;
        cityId?: string;
        maxCost?: string;
        maxDuration?: string;
        limit?: string;
      };

      const activities = await activitiesService.searchActivities({
        q,
        type,
        cityId,
        maxCost: maxCost ? parseFloat(maxCost) : undefined,
        maxDuration: maxDuration ? parseFloat(maxDuration) : undefined,
        limit: limit ? parseInt(limit, 10) : 20,
      });

      ApiResponse.success(res, activities);
    } catch (err) {
      next(err);
    }
  }
}

export const activitiesController = new ActivitiesController();
