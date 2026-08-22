// ============================================================================
// Standardized API Response Wrapper
// ============================================================================

import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse {
  /**
   * Send a success response with data
   */
  static success<T>(
    res: Response,
    data: T,
    statusCode: number = 200,
    meta?: PaginationMeta
  ): Response {
    return res.status(statusCode).json({
      success: true,
      data,
      ...(meta && { meta }),
    });
  }

  /**
   * Send a success response with no data (e.g., DELETE)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Send a created response (201)
   */
  static created<T>(res: Response, data: T): Response {
    return res.status(201).json({
      success: true,
      data,
    });
  }

  /**
   * Send a paginated list response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number
  ): Response {
    return res.status(200).json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  /**
   * Send an error response
   */
  static error(
    res: Response,
    statusCode: number,
    message: string,
    code: string = 'ERROR',
    details?: Record<string, unknown>[]
  ): Response {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    });
  }
}
