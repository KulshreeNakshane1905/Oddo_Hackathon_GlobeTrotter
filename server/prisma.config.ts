// ============================================================================
// Prisma Configuration — Prisma v7+ config file
// ============================================================================

import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),

  migrate: {
    async development() {
      const dotenv = await import('dotenv');
      dotenv.config({ path: path.join(__dirname, '.env') });

      return {
        url: process.env.DATABASE_URL!,
      };
    },
  },
});
