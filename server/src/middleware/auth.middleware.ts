// ============================================================================
// Auth Middleware — Verifies Local JWT from Authorization header
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logger } from '../utils/logger';

// Augment Express Request with user info
export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  isAdmin?: boolean;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only-do-not-use-in-prod';

/**
 * Middleware that verifies the JWT and attaches user info to the request.
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

    // Verify local JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded || !decoded.id) {
      ApiResponse.error(res, 401, 'Invalid or expired token', 'UNAUTHORIZED');
      return;
    }

    // Attach user info to request
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.isAdmin = decoded.role === 'admin';

    next();
  } catch (err) {
    logger.warn('Auth middleware error: ' + (err as Error).message);
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
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded && decoded.id) {
          req.userId = decoded.id;
          req.userEmail = decoded.email;
          req.isAdmin = decoded.role === 'admin';
        }
      }
    }

    next();
  } catch {
    // Continue without auth — it's optional
    next();
  }
}
