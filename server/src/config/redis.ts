// ============================================================================
// Redis Client — Connection to local Redis (dev) or Railway Redis (prod)
// ============================================================================

import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redis: Redis | null = null;

/**
 * Returns a singleton Redis client instance.
 * Gracefully handles connection failures — the app continues without caching.
 */
export function getRedisClient(): Redis | null {
  if (redis) return redis;

  try {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn('Redis: Max retries reached, disabling cache');
          return null; // Stop retrying
        }
        return Math.min(times * 200, 2000); // Exponential backoff
      },
      lazyConnect: true,
    });

    redis.on('connect', () => {
      logger.info('✅ Redis connected');
    });

    redis.on('error', (err) => {
      logger.warn(`Redis connection error: ${err.message}`);
    });

    // Attempt connection (non-blocking)
    redis.connect().catch((err) => {
      logger.warn(`Redis failed to connect: ${err.message}. App will run without cache.`);
      redis = null;
    });

    return redis;
  } catch {
    logger.warn('Redis initialization failed. App will run without cache.');
    return null;
  }
}

/**
 * Cache helper — get cached value or compute and cache it
 */
export async function cacheGet(key: string): Promise<string | null> {
  const client = getRedisClient();
  if (!client) return null;
  try {
    return await client.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.setex(key, ttlSeconds, value);
  } catch {
    // Silently fail — cache is optional
  }
}

export async function cacheDelete(pattern: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch {
    // Silently fail
  }
}
