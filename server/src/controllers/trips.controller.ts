// ============================================================================
// Trips Controller — Handles HTTP requests for trip operations
// ============================================================================

import { Response, NextFunction } from 'express';
import { tripsService } from '../services/trips.service';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class TripsController {
  /**
   * POST /api/trips — Create a new trip
   */
  async createTrip(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        ApiResponse.error(res, 401, 'Not authenticated', 'UNAUTHORIZED');
        return;
      }

      const trip = await tripsService.create(req.userId, req.body);
      ApiResponse.created(res, trip);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/trips — List user's trips with pagination and sorting
   */
  async getTrips(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        ApiResponse.error(res, 401, 'Not authenticated', 'UNAUTHORIZED');
        return;
      }

      const { page, limit, sort, order, upcoming } = req.query as {
        page?: string;
        limit?: string;
        sort?: 'createdAt' | 'startDate' | 'tripName' | 'updatedAt';
        order?: 'asc' | 'desc';
        upcoming?: string;
      };

      const result = await tripsService.findAllByUser(req.userId, {
        page: parseInt(page || '1', 10),
        limit: Math.min(50, parseInt(limit || '10', 10)),
        sort: sort || 'createdAt',
        order: order || 'desc',
        upcoming: upcoming === 'true',
      });

      ApiResponse.success(res, result.trips, 200, result.pagination);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/trips/:id — Get a single trip with full details
   */
  async getTripById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        ApiResponse.error(res, 401, 'Not authenticated', 'UNAUTHORIZED');
        return;
      }

      const tripId = req.params.id as string;
      const trip = await tripsService.findById(tripId, req.userId);
      ApiResponse.success(res, trip);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/trips/:id — Update a trip
   */
  async updateTrip(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        ApiResponse.error(res, 401, 'Not authenticated', 'UNAUTHORIZED');
        return;
      }

      const tripId = req.params.id as string;
      const trip = await tripsService.update(tripId, req.userId, req.body);
      ApiResponse.success(res, trip);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/trips/:id — Delete a trip
   */
  async deleteTrip(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        ApiResponse.error(res, 401, 'Not authenticated', 'UNAUTHORIZED');
        return;
      }

      const tripId = req.params.id as string;
      await tripsService.delete(tripId, req.userId);
      ApiResponse.noContent(res);
    } catch (err) {
      next(err);
    }
  }
}

export const tripsController = new TripsController();
