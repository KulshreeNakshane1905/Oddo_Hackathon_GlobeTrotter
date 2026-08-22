// ============================================================================
// Activities Service — StopActivity CRUD + Activity search with caching
// ============================================================================

import { PrismaClient, Prisma, ActivityType } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis';

const prisma = new PrismaClient();

const ACTIVITY_SEARCH_TTL = 60 * 60; // 1 hour

interface AddActivityData {
  activityId: string;
  scheduledTime: string;
  cost?: number;
  notes?: string;
}

interface UpdateStopActivityData {
  scheduledTime?: string;
  cost?: number;
  notes?: string;
}

interface ActivitySearchParams {
  q: string;
  type?: ActivityType;
  cityId?: string;
  maxCost?: number;
  maxDuration?: number;
  limit?: number;
}

export class ActivitiesService {
  /**
   * Verify that the user owns the stop (via its trip).
   */
  private async verifyStopOwnership(stopId: string, userId: string) {
    const stop = await prisma.stop.findUnique({
      where: { id: stopId },
      include: {
        trip: { select: { id: true, userId: true } },
      },
    });

    if (!stop) {
      throw ApiError.notFound('Stop');
    }
    if (stop.trip.userId !== userId) {
      throw ApiError.forbidden('You do not have access to this stop');
    }
    return stop;
  }

  /**
   * Verify ownership of a stop activity (via its stop → trip).
   */
  private async verifyStopActivityOwnership(stopActivityId: string, userId: string) {
    const sa = await prisma.stopActivity.findUnique({
      where: { id: stopActivityId },
      include: {
        stop: {
          include: {
            trip: { select: { id: true, userId: true } },
          },
        },
      },
    });

    if (!sa) {
      throw ApiError.notFound('Stop activity');
    }
    if (sa.stop.trip.userId !== userId) {
      throw ApiError.forbidden('You do not have access to this activity');
    }
    return sa;
  }

  /**
   * Add an activity to a stop.
   */
  async addActivityToStop(userId: string, stopId: string, data: AddActivityData) {
    const stop = await this.verifyStopOwnership(stopId, userId);

    // Verify the activity exists
    const activity = await prisma.activity.findUnique({
      where: { id: data.activityId },
    });
    if (!activity) {
      throw ApiError.notFound('Activity');
    }

    // Create the stop-activity link
    const stopActivity = await prisma.stopActivity.create({
      data: {
        stopId,
        activityId: data.activityId,
        scheduledTime: new Date(data.scheduledTime),
        cost: data.cost ?? Number(activity.avgCost),
        notes: data.notes || '',
      },
      include: { activity: true },
    });

    // Invalidate budget cache
    await cacheDelete(`trip:${stop.tripId}:budget`);

    logger.info(`Activity ${data.activityId} added to stop ${stopId}`);
    return stopActivity;
  }

  /**
   * Update a stop activity (scheduled time, cost, notes).
   */
  async updateStopActivity(userId: string, stopActivityId: string, data: UpdateStopActivityData) {
    const existing = await this.verifyStopActivityOwnership(stopActivityId, userId);

    const updateData: Prisma.StopActivityUpdateInput = {};
    if (data.scheduledTime !== undefined) updateData.scheduledTime = new Date(data.scheduledTime);
    if (data.cost !== undefined) updateData.cost = data.cost;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const stopActivity = await prisma.stopActivity.update({
      where: { id: stopActivityId },
      data: updateData,
      include: { activity: true },
    });

    // Invalidate budget cache
    await cacheDelete(`trip:${existing.stop.tripId}:budget`);

    logger.info(`Stop activity updated: ${stopActivityId}`);
    return stopActivity;
  }

  /**
   * Remove an activity from a stop.
   */
  async removeStopActivity(userId: string, stopActivityId: string) {
    const existing = await this.verifyStopActivityOwnership(stopActivityId, userId);

    await prisma.stopActivity.delete({ where: { id: stopActivityId } });

    // Invalidate budget cache
    await cacheDelete(`trip:${existing.stop.tripId}:budget`);

    logger.info(`Stop activity removed: ${stopActivityId}`);
  }

  /**
   * Search activities by name with optional filters.
   * Results are cached in Redis for 1 hour.
   */
  async searchActivities(params: ActivitySearchParams) {
    const { q, type, cityId, maxCost, maxDuration, limit = 20 } = params;

    // Build cache key
    const cacheKey = `activity:search:${q.toLowerCase()}:${type || 'all'}:${cityId || 'all'}:${maxCost || 'any'}:${maxDuration || 'any'}:${limit}`;

    // Try cache first
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Build where clause
    const where: Prisma.ActivityWhereInput = {
      name: {
        contains: q,
        mode: 'insensitive',
      },
    };

    if (type) {
      where.type = type;
    }
    if (cityId) {
      where.cityId = cityId;
    }
    if (maxCost !== undefined) {
      where.avgCost = { lte: maxCost };
    }
    if (maxDuration !== undefined) {
      where.durationHours = { lte: maxDuration };
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        city: {
          select: { id: true, name: true, country: true },
        },
      },
      orderBy: { name: 'asc' },
      take: Math.min(50, limit),
    });

    // Cache the result
    await cacheSet(cacheKey, JSON.stringify(activities), ACTIVITY_SEARCH_TTL);

    return activities;
  }
}

export const activitiesService = new ActivitiesService();
