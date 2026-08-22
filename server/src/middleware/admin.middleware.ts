// ============================================================================
// Admin Middleware — Restricts access to admin users only
// ============================================================================

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * Must be used AFTER authMiddleware.
 * Checks that the authenticated user has admin privileges.
 */
export function adminMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.isAdmin) {
    ApiResponse.error(res, 403, 'Admin access required', 'FORBIDDEN');
    return;
  }
  next();
}
