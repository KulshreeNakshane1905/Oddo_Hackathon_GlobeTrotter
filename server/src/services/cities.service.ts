// ============================================================================
// Cities Service — Popular cities & search with Redis caching
// ============================================================================

import { PrismaClient, Prisma } from '@prisma/client';
import { cacheGet, cacheSet } from '../config/redis';
import { logger } from '../utils/logger';

import prisma from '../utils/prisma';


// Cache TTLs (in seconds)
const POPULAR_CITIES_TTL = 6 * 60 * 60; // 6 hours
const CITY_SEARCH_TTL = 24 * 60 * 60;   // 24 hours

export class CitiesService {
  /**
   * Get popular cities ordered by popularity score.
   * Results are cached in Redis for 6 hours.
   */
  async getPopular(limit: number = 12) {
    const cacheKey = `cities:popular:${limit}`;

    // Try cache first
    const cached = await cacheGet(cacheKey);
    if (cached) {
      logger.debug(`Cache hit: ${cacheKey}`);
      return JSON.parse(cached);
    }

    const cities = await prisma.city.findMany({
      orderBy: { popularityScore: 'desc' },
      take: limit,
    });

    // Cache the result
    await cacheSet(cacheKey, JSON.stringify(cities), POPULAR_CITIES_TTL);
    logger.debug(`Cache set: ${cacheKey}`);

    return cities;
  }

  /**
   * Search cities by name with optional country filter.
   * Case-insensitive search using Prisma's `contains` with mode: 'insensitive'.
   */
  async search(query: string, country?: string, limit: number = 20) {
    const cacheKey = `city:search:${query.toLowerCase()}:${country || 'all'}:${limit}`;

    // Try cache first
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const where: Prisma.CityWhereInput = {
      name: {
        contains: query,
        mode: 'insensitive',
      },
    };

    if (country) {
      where.countryCode = country.toUpperCase();
    }

    const cities = await prisma.city.findMany({
      where,
      orderBy: { popularityScore: 'desc' },
      take: limit,
    });

    // Cache the result
    await cacheSet(cacheKey, JSON.stringify(cities), CITY_SEARCH_TTL);

    return cities;
  }
}

export const citiesService = new CitiesService();
