// ============================================================================
// Auth Middleware — Verifies Supabase JWT from Authorization header
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin } from '../config/supabase';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logger } from '../utils/logger';

// Augment Express Request with user info
export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  isAdmin?: boolean;
}

/**
 * Middleware that verifies the Supabase JWT and attaches user info to the request.
 * Expects: Authorization: Bearer <jwt>
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ApiResponse.error(res, 401, 'Authentication required', 'UNAUTHORIZED');
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      ApiResponse.error(res, 401, 'Invalid token format', 'UNAUTHORIZED');
      return;
    }

    // Verify token using Supabase Admin client
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      logger.warn(`Auth failed: ${error?.message || 'No user found'}`);
      ApiResponse.error(res, 401, 'Invalid or expired token', 'UNAUTHORIZED');
      return;
    }

    // Attach user info to request
    req.userId = data.user.id;
    req.userEmail = data.user.email;

    // Check admin status from user metadata or database
    req.isAdmin = data.user.user_metadata?.is_admin === true;

    next();
  } catch (err) {
    logger.error('Auth middleware error:', err);
    ApiResponse.error(res, 401, 'Authentication failed', 'UNAUTHORIZED');
  }
}

/**
 * Optional auth — attaches user info if token present, but doesn't block
 */
export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const supabase = getSupabaseAdmin();
        const { data } = await supabase.auth.getUser(token);
        if (data.user) {
          req.userId = data.user.id;
          req.userEmail = data.user.email;
          req.isAdmin = data.user.user_metadata?.is_admin === true;
        }
      }
    }

    next();
  } catch {
    // Continue without auth — it's optional
    next();
  }
}
