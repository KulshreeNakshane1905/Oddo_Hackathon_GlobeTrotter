// ============================================================================
// Stop Validators — Zod schemas for stop-related requests
// ============================================================================

import { z } from 'zod';

/**
 * Schema for adding a stop to a trip.
 * Enforces: valid city UUID, date range, optional costs.
 */
export const createStopSchema = z
  .object({
    cityId: z.string().uuid('Invalid city ID'),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
    notes: z
      .string()
      .max(2000, 'Notes must be at most 2000 characters')
      .trim()
      .optional()
      .default(''),
    transportCost: z
      .number()
      .min(0, 'Transport cost cannot be negative')
      .max(999999, 'Transport cost is too large')
      .optional(),
    accommodationCost: z
      .number()
      .min(0, 'Accommodation cost cannot be negative')
      .max(999999, 'Accommodation cost is too large')
      .optional(),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

/**
 * Schema for updating a stop — all fields optional.
 */
export const updateStopSchema = z
  .object({
    cityId: z.string().uuid('Invalid city ID').optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
      .optional(),
    notes: z
      .string()
      .max(2000, 'Notes must be at most 2000 characters')
      .trim()
      .optional(),
    transportCost: z
      .number()
      .min(0, 'Transport cost cannot be negative')
      .max(999999, 'Transport cost is too large')
      .nullable()
      .optional(),
    accommodationCost: z
      .number()
      .min(0, 'Accommodation cost cannot be negative')
      .max(999999, 'Accommodation cost is too large')
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
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
 * Schema for batch reordering stops.
 * Expects an array of stop IDs in the desired order.
 */
export const reorderStopsSchema = z.object({
  orderedIds: z
    .array(z.string().uuid('Invalid stop ID'))
    .min(1, 'At least one stop ID is required'),
});

export type CreateStopInput = z.infer<typeof createStopSchema>;
export type UpdateStopInput = z.infer<typeof updateStopSchema>;
export type ReorderStopsInput = z.infer<typeof reorderStopsSchema>;
