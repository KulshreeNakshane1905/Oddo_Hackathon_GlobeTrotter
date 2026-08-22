// ============================================================================
// Trip Service — Business logic for trip CRUD operations
// ============================================================================

import { PrismaClient, Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis';

import prisma from '../utils/prisma';


// ── Select fields for trip listings (lightweight) ────────────────────────────
const tripListSelect = {
  id: true,
  tripName: true,
  description: true,
  startDate: true,
  endDate: true,
  coverPhotoUrl: true,
  isPublic: true,
  dailyBudget: true,
  currency: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { stops: true },
  },
} satisfies Prisma.TripSelect;

// ── Select fields for full trip detail (deep include) ────────────────────────
const tripDetailInclude = {
  stops: {
    orderBy: { orderIndex: 'asc' as const },
    include: {
      city: true,
      activities: {
        include: {
          activity: true,
        },
        orderBy: { scheduledTime: 'asc' as const },
      },
    },
  },
  budgetEstimate: true,
} satisfies Prisma.TripInclude;

// ── Type for sort parameters ─────────────────────────────────────────────────
type TripSortField = 'createdAt' | 'startDate' | 'tripName' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

interface TripListParams {
  page: number;
  limit: number;
  sort: TripSortField;
  order: SortOrder;
  upcoming?: boolean;
}

interface CreateTripData {
  tripName: string;
  description?: string;
  startDate: string;
  endDate: string;
  coverPhotoUrl?: string;
  dailyBudget?: number;
  currency?: string;
}

interface UpdateTripData {
  tripName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  coverPhotoUrl?: string | null;
  isPublic?: boolean;
  dailyBudget?: number | null;
  currency?: string;
}

export class TripsService {
  /**
   * Create a new trip for the authenticated user.
   */
  async create(userId: string, data: CreateTripData) {
    const trip = await prisma.trip.create({
      data: {
        userId,
        tripName: data.tripName,
        description: data.description || '',
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        coverPhotoUrl: data.coverPhotoUrl,
        dailyBudget: data.dailyBudget,
        currency: data.currency || 'USD',
      },
      select: tripListSelect,
    });

    logger.info(`Trip created: ${trip.id} by user ${userId}`);
    return trip;
  }

  /**
   * Get all trips for a user with pagination and sorting.
   */
  async findAllByUser(userId: string, params: TripListParams) {
    const { page, limit, sort, order, upcoming } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.TripWhereInput = { userId };

    // Filter for upcoming trips only
    if (upcoming) {
      where.startDate = { gte: new Date() };
    }

    // Run count and data queries in parallel
    const [total, trips] = await Promise.all([
      prisma.trip.count({ where }),
      prisma.trip.findMany({
        where,
        select: tripListSelect,
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
    ]);

    return {
      trips,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single trip by ID with full details (stops, activities, cities).
   * Verifies the user owns the trip.
   */
  async findById(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: tripDetailInclude,
    });

    if (!trip) {
      throw ApiError.notFound('Trip');
    }

    // Ownership check
    if (trip.userId !== userId) {
      throw ApiError.forbidden('You do not have access to this trip');
    }

    return trip;
  }

  /**
   * Update a trip. Verifies ownership first.
   */
  async update(tripId: string, userId: string, data: UpdateTripData) {
    // Verify ownership
    const existing = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { userId: true, startDate: true, endDate: true },
    });

    if (!existing) {
      throw ApiError.notFound('Trip');
    }

    if (existing.userId !== userId) {
      throw ApiError.forbidden('You do not have access to this trip');
    }

    // Build update payload — only include fields that are explicitly provided
    const updateData: Prisma.TripUpdateInput = {};

    if (data.tripName !== undefined) updateData.tripName = data.tripName;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.coverPhotoUrl !== undefined) updateData.coverPhotoUrl = data.coverPhotoUrl;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
    if (data.dailyBudget !== undefined) updateData.dailyBudget = data.dailyBudget;
    if (data.currency !== undefined) updateData.currency = data.currency;

    // Cross-validate date range if only one date is changing
    if (data.startDate && !data.endDate) {
      if (new Date(data.startDate) > existing.endDate) {
        throw ApiError.badRequest([
          { field: 'startDate', message: 'Start date cannot be after the existing end date' },
        ] as any);
      }
    }
    if (data.endDate && !data.startDate) {
      if (new Date(data.endDate) < existing.startDate) {
        throw ApiError.badRequest([
          { field: 'endDate', message: 'End date cannot be before the existing start date' },
        ] as any);
      }
    }

    const trip = await prisma.trip.update({
      where: { id: tripId },
      data: updateData,
      select: tripListSelect,
    });

    // Invalidate budget cache on date changes
    if (data.startDate || data.endDate) {
      await cacheDelete(`trip:${tripId}:budget`);
    }

    logger.info(`Trip updated: ${tripId} by user ${userId}`);
    return trip;
  }

  /**
   * Delete a trip and all cascading data. Verifies ownership.
   */
  async delete(tripId: string, userId: string) {
    const existing = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { userId: true },
    });

    if (!existing) {
      throw ApiError.notFound('Trip');
    }

    if (existing.userId !== userId) {
      throw ApiError.forbidden('You do not have access to this trip');
    }

    await prisma.trip.delete({ where: { id: tripId } });

    // Invalidate related caches
    await cacheDelete(`trip:${tripId}:*`);

    logger.info(`Trip deleted: ${tripId} by user ${userId}`);
  }

  /**
   * Get upcoming trips for a user (startDate >= today).
   */
  async getUpcoming(userId: string, limit: number = 3) {
    const trips = await prisma.trip.findMany({
      where: {
        userId,
        startDate: { gte: new Date() },
      },
      select: tripListSelect,
      orderBy: { startDate: 'asc' },
      take: limit,
    });

    return trips;
  }
}

export const tripsService = new TripsService();
