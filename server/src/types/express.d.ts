// ============================================================================
// Express Type Extensions
// ============================================================================

import { AuthenticatedRequest } from '../middleware/auth.middleware';

declare global {
  namespace Express {
    // Extend the Express Request with our auth properties
    interface Request {
      userId?: string;
      userEmail?: string;
      isAdmin?: boolean;
    }
  }
}

export { AuthenticatedRequest };
