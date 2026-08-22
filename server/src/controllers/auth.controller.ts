// ============================================================================
// Auth Controller — Handles HTTP requests for authentication
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, fullName } = req.body;
      const user = await authService.register({ email, password, fullName });
      ApiResponse.created(res, user);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/refresh
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        ApiResponse.error(res, 400, 'Refresh token is required', 'BAD_REQUEST');
        return;
      }
      const session = await authService.refreshToken(refreshToken);
      ApiResponse.success(res, session);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Client-side token invalidation; server just acknowledges
      ApiResponse.success(res, { message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/auth/me — Get current user profile
   */
  async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        ApiResponse.error(res, 401, 'Not authenticated', 'UNAUTHORIZED');
        return;
      }
      const user = await authService.getUserById(req.userId);
      ApiResponse.success(res, user);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
