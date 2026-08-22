// ============================================================================
// Auth Middleware — Verifies Supabase JWT from Authorization header
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { getSupabaseAdmin } from '../config/supabase';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import jwt from 'jsonwebtoken';

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

    const isLocalMock = env.SUPABASE_URL.includes('localhost');
    let userData: any = null;

    if (isLocalMock) {
      // Local mock JWT verification
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET || 'secret') as any;
        userData = { id: decoded.id, email: decoded.email, user_metadata: { is_admin: decoded.is_admin } };
      } catch (e) {
        // Fall through to error response below
      }
    } else {
      // Verify token using Supabase Admin client
      const supabase = getSupabaseAdmin();
      const { data, error } = await (supabase.auth as any).getUser(token);
      if (!error && data?.user) {
        userData = data.user;
      } else {
        logger.warn(`Auth failed: ${error?.message || 'No user found'}`);
      }
    }

    if (!userData) {
      ApiResponse.error(res, 401, 'Invalid or expired token', 'UNAUTHORIZED');
      return;
    }

    // Attach user info to request
    req.userId = userData.id;
    req.userEmail = userData.email;

    // Check admin status from user metadata or database
    req.isAdmin = userData.user_metadata?.is_admin === true;

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
        const isLocalMock = env.SUPABASE_URL.includes('localhost');
        if (isLocalMock) {
          try {
            const decoded = jwt.verify(token, env.JWT_SECRET || 'secret') as any;
            req.userId = decoded.id;
            req.userEmail = decoded.email;
            req.isAdmin = decoded.is_admin === true;
          } catch (e) {
            // silent fail
          }
        } else {
          const supabase = getSupabaseAdmin();
          const { data } = await (supabase.auth as any).getUser(token);
          if (data.user) {
            req.userId = data.user.id;
            req.userEmail = data.user.email;
            req.isAdmin = data.user.user_metadata?.is_admin === true;
          }
        }
      }
    }

    next();
  } catch {
    // Continue without auth — it's optional
    next();
  }
}
