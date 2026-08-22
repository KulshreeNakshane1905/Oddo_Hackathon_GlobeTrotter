// ============================================================================
// Request Logger — HTTP request logging via Morgan + Winston
// ============================================================================

import morgan from 'morgan';
import { logger } from '../utils/logger';

// Stream morgan output to Winston
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

/**
 * HTTP request logger middleware.
 * Uses 'combined' format in production, 'dev' in development.
 */
export const requestLogger = morgan(
  process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  { stream }
);
