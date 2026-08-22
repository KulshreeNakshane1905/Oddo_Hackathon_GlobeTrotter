// ============================================================================
// Users Controller — Handles HTTP requests for user profiles and saved cities
// ============================================================================

import { Response, NextFunction } from 'express';
import { usersService } from '../services/users.service';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { z } from 'zod';

const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  languagePref: z.string().length(2).optional(),
  profilePic: z.string().url().optional(),
});

const saveCitySchema = z.object({
  cityId: z.string().uuid('Invalid city ID'),
});

export class UsersController {
  /**
   * GET /api/users/me — Delegate to authService for getting profile since auth.service 
   * already has a getUserById method (which we use for login). Or we can fetch directly.
   */
  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // The auth middleware already puts req.user on the request (if we fetch it there)
      // But let's fetch fresh from usersService or authService
      const { authService } = await import('../services/auth.service');
      const user = await authService.getUserById(req.userId!);
      ApiResponse.success(res, user);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/users/me — Update user profile
   */
  async updateMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateProfileSchema.parse(req.body);
      const user = await usersService.updateProfile(req.userId!, data);
      ApiResponse.success(res, user);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/users/me — Delete user account permanently
   */
  async deleteMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await usersService.deleteAccount(req.userId!);
      ApiResponse.success(res, { message: 'Account deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/users/me/saved-cities — Get user's saved cities
   */
  async getSavedCities(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cities = await usersService.getSavedCities(req.userId!);
      ApiResponse.success(res, cities);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/users/me/saved-cities — Save a city
   */
  async saveCity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cityId } = saveCitySchema.parse(req.body);
      const city = await usersService.saveCity(req.userId!, cityId);
      ApiResponse.success(res, city, 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/users/me/saved-cities/:cityId — Unsave a city
   */
  async unsaveCity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cityId = String(req.params.cityId) as string;
      await usersService.unsaveCity(req.userId!, cityId);
      ApiResponse.success(res, { message: 'City removed from saved list' });
    } catch (err) {
      next(err);
    }
  }
}

export const usersController = new UsersController();
