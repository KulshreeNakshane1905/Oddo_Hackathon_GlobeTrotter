// ============================================================================
// Utility Helpers
// ============================================================================

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a URL-safe share token
 */
export function generateShareToken(): string {
  return uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '').slice(0, 8);
}

/**
 * Parse pagination query params with defaults
 */
export function parsePagination(query: { page?: string; limit?: string }): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Calculate number of nights between two dates
 */
export function calculateNights(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Sanitize a string for safe display (basic XSS prevention)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
