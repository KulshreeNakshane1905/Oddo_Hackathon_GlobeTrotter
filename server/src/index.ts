// ============================================================================
// Server Entry Point
// ============================================================================

import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { getRedisClient } from './config/redis';

async function bootstrap() {
  // Initialize Redis (non-blocking — app works without it)
  getRedisClient();

  // Start the HTTP server
  const server = app.listen(env.PORT, () => {
    logger.info(`
    🌍 GlobalTrotters API Server
    ────────────────────────────
    🚀 Running on:    http://localhost:${env.PORT}
    📦 Environment:   ${env.NODE_ENV}
    🔗 API Base:      http://localhost:${env.PORT}/api
    ❤️  Health Check:  http://localhost:${env.PORT}/api/health
    ────────────────────────────
    `);
  });

  // Graceful shutdown
  const shutdown = (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
