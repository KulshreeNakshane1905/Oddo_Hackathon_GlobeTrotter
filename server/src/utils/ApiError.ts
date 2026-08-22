// ============================================================================
// Custom API Error Class — Standardized error handling
// ============================================================================

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>[];

  constructor(
    statusCode: number,
    message: string,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown>[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  // ── Factory methods for common errors ──────────────────────────────────
  static badRequest(message: string, details?: Record<string, unknown>[]) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  static unauthorized(message: string = 'Authentication required') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Access denied') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(resource: string = 'Resource') {
    return new ApiError(404, `${resource} not found`, 'NOT_FOUND');
  }

  static conflict(message: string) {
    return new ApiError(409, message, 'CONFLICT');
  }

  static tooManyRequests(message: string = 'Too many requests') {
    return new ApiError(429, message, 'RATE_LIMITED');
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }

  static validationError(details: Record<string, unknown>[]) {
    return new ApiError(422, 'Validation failed', 'VALIDATION_ERROR', details);
  }
}
