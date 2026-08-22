// ============================================================================
// Trip Validators — Zod schemas for trip-related requests
// ============================================================================

import { z } from 'zod';

/**
 * Schema for creating a new trip.
 * Enforces: endDate ≥ startDate, sensible defaults.
 */
export const createTripSchema = z
  .object({
    tripName: z
      .string()
      .min(2, 'Trip name must be at least 2 characters')
      .max(255, 'Trip name must be at most 255 characters')
      .trim(),
    description: z
      .string()
      .max(2000, 'Description must be at most 2000 characters')
      .trim()
      .optional()
      .default(''),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
    coverPhotoUrl: z.string().url('Invalid cover photo URL').optional(),
    dailyBudget: z
      .number()
      .min(0, 'Daily budget cannot be negative')
      .max(999999, 'Daily budget is too large')
      .optional(),
    currency: z
      .string()
      .length(3, 'Currency must be a 3-letter ISO code')
      .toUpperCase()
      .optional()
      .default('USD'),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

/**
 * Schema for updating a trip — all fields optional.
 */
export const updateTripSchema = z
  .object({
    tripName: z
      .string()
      .min(2, 'Trip name must be at least 2 characters')
      .max(255, 'Trip name must be at most 255 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, 'Description must be at most 2000 characters')
      .trim()
      .optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
      .optional(),
    coverPhotoUrl: z.string().url('Invalid cover photo URL').nullable().optional(),
    isPublic: z.boolean().optional(),
    dailyBudget: z
      .number()
      .min(0, 'Daily budget cannot be negative')
      .max(999999, 'Daily budget is too large')
      .nullable()
      .optional(),
    currency: z
      .string()
      .length(3, 'Currency must be a 3-letter ISO code')
      .toUpperCase()
      .optional(),
  })
  .refine(
    (data) => {
      // Only validate date range if both dates are provided
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

/**
 * Schema for trip list query params.
 */
export const tripQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional().default('1'),
  limit: z.string().regex(/^\d+$/).optional().default('10'),
  sort: z
    .enum(['createdAt', 'startDate', 'tripName', 'updatedAt'])
    .optional()
    .default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  upcoming: z.string().regex(/^(true|false)$/).optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type TripQueryInput = z.infer<typeof tripQuerySchema>;
