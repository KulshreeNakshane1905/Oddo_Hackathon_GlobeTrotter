// ============================================================================
// Stops Service — Business logic for stop CRUD and reordering
// ============================================================================

import { PrismaClient, Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { cacheDelete } from '../config/redis';

import prisma from '../utils/prisma';


// ── Select fields for stop response ──────────────────────────────────────────
const stopInclude = {
  city: true,
  activities: {
    include: { activity: true },
    orderBy: { scheduledTime: 'asc' as const },
  },
} satisfies Prisma.StopInclude;

interface CreateStopData {
  cityId: string;
  startDate: string;
  endDate: string;
  notes?: string;
  transportCost?: number;
  accommodationCost?: number;
}

interface UpdateStopData {
  cityId?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  transportCost?: number | null;
  accommodationCost?: number | null;
}

export class StopsService {
  /**
   * Verify user owns the trip. Returns the trip or throws.
   */
  private async verifyTripOwnership(tripId: string, userId: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { id: true, userId: true, startDate: true, endDate: true },
    });

    if (!trip) {
      throw ApiError.notFound('Trip');
    }
    if (trip.userId !== userId) {
      throw ApiError.forbidden('You do not have access to this trip');
    }
    return trip;
  }

  /**
   * Verify user owns the stop (via its trip). Returns the stop with trip info.
   */
  private async verifyStopOwnership(stopId: string, userId: string) {
    const stop = await prisma.stop.findUnique({
      where: { id: stopId },
      include: {
        trip: { select: { id: true, userId: true, startDate: true, endDate: true } },
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
   * Add a new stop to a trip.
   * Auto-assigns orderIndex to the end of the list.
   * Validates stop dates are within the trip date range.
   */
  async addStop(userId: string, tripId: string, data: CreateStopData) {
    const trip = await this.verifyTripOwnership(tripId, userId);

    // Validate city exists
    const city = await prisma.city.findUnique({ where: { id: data.cityId } });
    if (!city) {
      throw ApiError.notFound('City');
    }

    // Validate stop dates are within trip date range
    const stopStart = new Date(data.startDate);
    const stopEnd = new Date(data.endDate);

    if (stopStart < trip.startDate || stopEnd > trip.endDate) {
      throw ApiError.badRequest(
        'Stop dates must be within the trip date range (' +
        trip.startDate.toISOString().split('T')[0] + ' to ' +
        trip.endDate.toISOString().split('T')[0] + ')'
      );
    }

    // Get the next orderIndex
    const maxOrderStop = await prisma.stop.findFirst({
      where: { tripId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });
    const nextOrder = (maxOrderStop?.orderIndex ?? -1) + 1;

    // Create the stop
    const stop = await prisma.stop.create({
      data: {
        tripId,
        cityId: data.cityId,
        orderIndex: nextOrder,
        startDate: stopStart,
        endDate: stopEnd,
        notes: data.notes || '',
        transportCost: data.transportCost,
        accommodationCost: data.accommodationCost,
      },
      include: stopInclude,
    });

    // Invalidate budget cache
    await cacheDelete(`trip:${tripId}:budget`);

    logger.info(`Stop added: ${stop.id} to trip ${tripId}`);
    return stop;
  }

  /**
   * Update an existing stop.
   */
  async updateStop(userId: string, stopId: string, data: UpdateStopData) {
    const existing = await this.verifyStopOwnership(stopId, userId);

    // If changing city, validate it exists
    if (data.cityId) {
      const city = await prisma.city.findUnique({ where: { id: data.cityId } });
      if (!city) {
        throw ApiError.notFound('City');
      }
    }

    // If changing dates, validate within trip range
    const newStart = data.startDate ? new Date(data.startDate) : existing.startDate;
    const newEnd = data.endDate ? new Date(data.endDate) : existing.endDate;
    const tripStart = existing.trip.startDate;
    const tripEnd = existing.trip.endDate;

    if (newStart < tripStart || newEnd > tripEnd) {
      throw ApiError.badRequest(
        'Stop dates must be within the trip date range (' +
        tripStart.toISOString().split('T')[0] + ' to ' +
        tripEnd.toISOString().split('T')[0] + ')'
      );
    }

    // Build update payload
    const updateData: Prisma.StopUpdateInput = {};
    if (data.cityId !== undefined) updateData.city = { connect: { id: data.cityId } };
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.transportCost !== undefined) updateData.transportCost = data.transportCost;
    if (data.accommodationCost !== undefined) updateData.accommodationCost = data.accommodationCost;

    const stop = await prisma.stop.update({
      where: { id: stopId },
      data: updateData,
      include: stopInclude,
    });

    // Invalidate budget cache
    await cacheDelete(`trip:${existing.tripId}:budget`);

    logger.info(`Stop updated: ${stopId}`);
    return stop;
  }

  /**
   * Delete a stop and renumber the remaining stops in the trip.
   */
  async deleteStop(userId: string, stopId: string) {
    const existing = await this.verifyStopOwnership(stopId, userId);
    const tripId = existing.tripId;
    const deletedOrder = existing.orderIndex;

    // Delete the stop (cascades to stop_activities)
    await prisma.stop.delete({ where: { id: stopId } });

    // Renumber remaining stops that were after the deleted one
    await prisma.stop.updateMany({
      where: {
        tripId,
        orderIndex: { gt: deletedOrder },
      },
      data: {
        orderIndex: { decrement: 1 },
      },
    });

    // Invalidate budget cache
    await cacheDelete(`trip:${tripId}:budget`);

    logger.info(`Stop deleted: ${stopId} from trip ${tripId}`);
  }

  /**
   * Batch reorder stops in a trip.
   * `orderedIds` is the full list of stop IDs in the desired order.
   */
  async reorderStops(userId: string, tripId: string, orderedIds: string[]) {
    await this.verifyTripOwnership(tripId, userId);

    // Verify all IDs belong to this trip
    const existingStops = await prisma.stop.findMany({
      where: { tripId },
      select: { id: true },
    });

    const existingIds = new Set(existingStops.map((s) => s.id));

    // Every provided ID must belong to this trip
    for (const id of orderedIds) {
      if (!existingIds.has(id)) {
        throw ApiError.badRequest(`Stop ${id} does not belong to this trip`);
      }
    }

    // Every existing stop must be in the ordered list
    if (orderedIds.length !== existingStops.length) {
      throw ApiError.badRequest(
        `Expected ${existingStops.length} stop IDs, received ${orderedIds.length}`
      );
    }

    // Batch update using a transaction
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.stop.update({
          where: { id },
          data: { orderIndex: index },
        })
      )
    );

    logger.info(`Stops reordered in trip ${tripId}`);

    // Return the updated stops in order
    const stops = await prisma.stop.findMany({
      where: { tripId },
      include: stopInclude,
      orderBy: { orderIndex: 'asc' },
    });

    return stops;
  }
}

export const stopsService = new StopsService();
