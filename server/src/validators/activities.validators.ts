// ============================================================================
// Activity Validators — Zod schemas for activity-related requests
// ============================================================================

import { z } from 'zod';

const activityTypeEnum = z.enum([
  'SIGHTSEEING',
  'FOOD',
  'ADVENTURE',
  'CULTURE',
  'NIGHTLIFE',
  'SHOPPING',
  'NATURE',
  'TRANSPORT',
  'OTHER',
]);

/**
 * Schema for adding an activity to a stop.
 */
export const addActivitySchema = z.object({
  activityId: z.string().uuid('Invalid activity ID'),
  scheduledTime: z
    .string()
    .datetime({ message: 'Scheduled time must be a valid ISO datetime' }),
  cost: z
    .number()
    .min(0, 'Cost cannot be negative')
    .max(999999, 'Cost is too large')
    .optional()
    .default(0),
  notes: z
    .string()
    .max(2000, 'Notes must be at most 2000 characters')
    .trim()
    .optional()
    .default(''),
});

/**
 * Schema for updating a stop activity — all fields optional.
 */
export const updateStopActivitySchema = z.object({
  scheduledTime: z
    .string()
    .datetime({ message: 'Scheduled time must be a valid ISO datetime' })
    .optional(),
  cost: z
    .number()
    .min(0, 'Cost cannot be negative')
    .max(999999, 'Cost is too large')
    .optional(),
  notes: z
    .string()
    .max(2000, 'Notes must be at most 2000 characters')
    .trim()
    .optional(),
});

/**
 * Schema for activity search query parameters.
 */
export const activitySearchSchema = z.object({
  q: z.string().min(1, 'Search query is required').trim(),
  type: activityTypeEnum.optional(),
  cityId: z.string().uuid('Invalid city ID').optional(),
  maxCost: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'maxCost must be a valid number')
    .optional(),
  maxDuration: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'maxDuration must be a valid number')
    .optional(),
  limit: z.string().regex(/^\d+$/).optional().default('20'),
});

export type AddActivityInput = z.infer<typeof addActivitySchema>;
export type UpdateStopActivityInput = z.infer<typeof updateStopActivitySchema>;
export type ActivitySearchInput = z.infer<typeof activitySearchSchema>;
