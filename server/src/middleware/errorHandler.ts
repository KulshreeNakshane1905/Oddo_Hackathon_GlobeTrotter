// ============================================================================
// Global Error Handler — Catches all unhandled errors
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Express error-handling middleware (must have 4 params).
 * Converts ApiError instances to structured responses.
 * Logs and masks unexpected errors in production.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle known API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
    return;
  }

  // Log unexpected errors
  logger.error('Unhandled error:', err);

  // Don't leak internal details in production
  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message;

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
      ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
}
