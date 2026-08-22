// ============================================================================
// Sharing Service — Public trip links and trip duplication
// ============================================================================

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { cacheGet, cacheSet } from '../config/redis';

import prisma from '../utils/prisma';

const PUBLIC_TRIP_CACHE_TTL = 600; // 10 minutes

export class SharingService {
  /**
   * Generate a secure sharing token for a trip and make it public.
   */
  async generateShareToken(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { userId: true, shareToken: true },
    });

    if (!trip) throw ApiError.notFound('Trip');
    if (trip.userId !== userId) throw ApiError.forbidden('You do not have access to this trip');

    // If it already has a token, return it
    if (trip.shareToken) {
      return { token: trip.shareToken };
    }

    const token = crypto.randomBytes(24).toString('hex');
    
    // Set expiry to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.$transaction([
      prisma.trip.update({
        where: { id: tripId },
        data: {
          isPublic: true,
          shareToken: token,
        },
      }),
      prisma.sharedLink.create({
        data: {
          tripId,
          token,
          expiresAt,
        },
      }),
    ]);

    logger.info(`Share token generated for trip ${tripId}`);
    return { token };
  }

  /**
   * Revoke sharing for a trip, making it private again.
   */
  async revokeShareLink(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { userId: true, shareToken: true },
    });

    if (!trip) throw ApiError.notFound('Trip');
    if (trip.userId !== userId) throw ApiError.forbidden('You do not have access to this trip');

    if (trip.shareToken) {
      await prisma.$transaction([
        prisma.sharedLink.deleteMany({
          where: { tripId },
        }),
        prisma.trip.update({
          where: { id: tripId },
          data: {
            isPublic: false,
            shareToken: null,
          },
        }),
      ]);
      
      // Invalidate cache if there was one
      const { cacheDelete } = await import('../config/redis');
      await cacheDelete(`public:trip:${trip.shareToken}`);
    }

    logger.info(`Share token revoked for trip ${tripId}`);
  }

  /**
   * Fetch a public trip by its share token.
   * Returns a read-only view including stops, activities, and budget.
   */
  async getPublicTrip(token: string) {
    const cacheKey = `public:trip:${token}`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Cache corrupted
      }
    }

    const trip = await prisma.trip.findUnique({
      where: { shareToken: token },
      include: {
        user: {
          select: { fullName: true, profilePic: true },
        },
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: {
            city: true,
            activities: {
              orderBy: { scheduledTime: 'asc' },
              include: { activity: true },
            },
          },
        },
        budgetEstimate: true,
      },
    });

    if (!trip || !trip.isPublic) {
      throw ApiError.notFound('Shared trip not found or is no longer public');
    }

    // Cache the public view
    await cacheSet(cacheKey, JSON.stringify(trip), PUBLIC_TRIP_CACHE_TTL);
    
    return trip;
  }

  /**
   * Deep copy a public trip to a new user's account.
   */
  async copyTrip(token: string, newUserId: string) {
    const publicTrip = await prisma.trip.findUnique({
      where: { shareToken: token },
      include: {
        stops: {
          include: {
            activities: true,
          },
        },
        budgetEstimate: true,
      },
    });

    if (!publicTrip || !publicTrip.isPublic) {
      throw ApiError.notFound('Shared trip not found or is no longer public');
    }

    // Execute everything in a single transaction for atomicity
    const newTrip = await prisma.$transaction(async (tx) => {
      // 1. Create the new trip
      const trip = await tx.trip.create({
        data: {
          userId: newUserId,
          tripName: `Copy of ${publicTrip.tripName}`,
          description: publicTrip.description,
          startDate: publicTrip.startDate,
          endDate: publicTrip.endDate,
          coverPhotoUrl: publicTrip.coverPhotoUrl,
          dailyBudget: publicTrip.dailyBudget,
          currency: publicTrip.currency,
          isPublic: false,
          shareToken: null,
        },
      });

      // 2. Create stops and activities
      for (const stop of publicTrip.stops) {
        const newStop = await tx.stop.create({
          data: {
            tripId: trip.id,
            cityId: stop.cityId,
            orderIndex: stop.orderIndex,
            startDate: stop.startDate,
            endDate: stop.endDate,
            notes: stop.notes,
            transportCost: stop.transportCost,
            accommodationCost: stop.accommodationCost,
          },
        });

        // Bulk insert activities for this stop
        if (stop.activities.length > 0) {
          await tx.stopActivity.createMany({
            data: stop.activities.map((act) => ({
              stopId: newStop.id,
              activityId: act.activityId,
              scheduledTime: act.scheduledTime,
              cost: act.cost,
              notes: act.notes,
            })),
          });
        }
      }

      // 3. Copy budget estimate if exists
      if (publicTrip.budgetEstimate) {
        await tx.budgetEstimate.create({
          data: {
            tripId: trip.id,
            totalTransport: publicTrip.budgetEstimate.totalTransport,
            totalAccommodation: publicTrip.budgetEstimate.totalAccommodation,
            totalActivities: publicTrip.budgetEstimate.totalActivities,
            totalMeals: publicTrip.budgetEstimate.totalMeals,
            totalOther: publicTrip.budgetEstimate.totalOther,
            currency: publicTrip.budgetEstimate.currency,
            calculatedAt: new Date(),
          },
        });
      }

      return trip;
    });

    logger.info(`User ${newUserId} copied trip ${publicTrip.id} into new trip ${newTrip.id}`);
    return newTrip;
  }
}

export const sharingService = new SharingService();
