// ============================================================================
// Sharing Controller — Handles HTTP requests for sharing and copying trips
// ============================================================================

import { Response, NextFunction, Request } from 'express';
import { sharingService } from '../services/sharing.service';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class SharingController {
  /**
   * POST /api/trips/:id/share — Generate share token
   */
  async shareTrip(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tripId = String(req.params.id);
      const result = await sharingService.generateShareToken(tripId, req.userId!);
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/trips/:id/share — Revoke share link
   */
  async unshareTrip(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tripId = String(req.params.id);
      await sharingService.revokeShareLink(tripId, req.userId!);
      ApiResponse.success(res, { message: 'Share link revoked' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/public/trip/:token — Get a public trip (No Auth Required)
   */
  async getPublicTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = String(req.params.token);
      const trip = await sharingService.getPublicTrip(token);
      ApiResponse.success(res, trip);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/public/trip/:token/copy — Copy a public trip to own account
   */
  async copyTrip(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = String(req.params.token);
      const newTrip = await sharingService.copyTrip(token, req.userId!);
      ApiResponse.success(res, newTrip, 201);
    } catch (err) {
      next(err);
    }
  }
}

export const sharingController = new SharingController();
