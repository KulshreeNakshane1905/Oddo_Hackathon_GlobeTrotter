// ============================================================================
// Validation Middleware — Uses Zod to validate request body/params/query
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../utils/ApiResponse';

type ValidationTarget = 'body' | 'params' | 'query';

/**
 * Creates a validation middleware for the specified request property.
 * Usage: validate(myZodSchema, 'body')
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);
      // Replace the target with parsed (cleaned) data
      (req as any)[target] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const zodErr = err as any;
        const errorsList = zodErr.issues || zodErr.errors || [];
        const details = errorsList.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));
        ApiResponse.error(res, 422, 'Validation failed', 'VALIDATION_ERROR', details);
        return;
      }
      next(err);
    }
  };
}
