// ============================================================================
// Budget Service — Computes trip budget breakdowns by category, stop, and day
// ============================================================================

import { PrismaClient, Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis';

import prisma from '../utils/prisma';


// ── Constants ────────────────────────────────────────────────────────────────
const BUDGET_CACHE_TTL = 300; // 5 minutes
const BASE_MEAL_RATE = 15; // $15 per meal
const MEALS_PER_DAY = 3;
const CONTINGENCY_RATE = 0.10; // 10% contingency for "Other"

// ── Types ────────────────────────────────────────────────────────────────────
export interface CategoryTotals {
  transport: number;
  accommodation: number;
  activities: number;
  meals: number;
  other: number;
  grandTotal: number;
}

export interface StopBudget {
  stopId: string;
  cityName: string;
  country: string;
  days: number;
  transport: number;
  accommodation: number;
  activities: number;
  meals: number;
  activityDetails: Array<{
    name: string;
    type: string;
    cost: number;
    scheduledTime: string;
  }>;
}

export interface DailyBudget {
  date: string;
  transport: number;
  accommodation: number;
  activities: number;
  meals: number;
  total: number;
  isOverBudget: boolean;
}

export interface BudgetBreakdown {
  tripId: string;
  currency: string;
  dailyBudgetLimit: number | null;
  totalDays: number;
  categoryTotals: CategoryTotals;
  stopBreakdowns: StopBudget[];
  dailyBreakdowns: DailyBudget[];
  overBudgetDays: number;
  calculatedAt: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'activity' | 'stop';
  activityType?: string;
  stopId: string;
  cityName: string;
  cost: number;
  notes: string | null;
  durationHours: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Calculate the number of days (inclusive) between two dates */
function daysBetween(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);
}

/** Convert a Prisma Decimal to a plain number */
function toNum(val: Prisma.Decimal | number | null | undefined): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  return val.toNumber();
}

/** Format a Date to YYYY-MM-DD */
function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** Generate an array of date strings between start and end (inclusive) */
function getDateRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(toDateStr(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export class BudgetService {
  /**
   * Compute a full budget breakdown for a trip.
   * Uses Redis cache when available. Otherwise, queries DB and computes.
   */
  async computeBudget(tripId: string, userId: string): Promise<BudgetBreakdown> {
    // ── Check cache first ──────────────────────────────────────────────
    const cacheKey = `trip:${tripId}:budget`;
    const cached = await cacheGet(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // Cache was corrupted, recompute
      }
    }

    // ── Fetch trip with all stops, activities, and city data ──────────
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: {
            city: true,
            activities: {
              include: { activity: true },
              orderBy: { scheduledTime: 'asc' },
            },
          },
        },
      },
    });

    if (!trip) {
      throw ApiError.notFound('Trip');
    }

    if (trip.userId !== userId) {
      throw ApiError.forbidden('You do not have access to this trip');
    }

    // ── Compute trip-level data ──────────────────────────────────────
    const tripStartDate = new Date(trip.startDate);
    const tripEndDate = new Date(trip.endDate);
    const totalDays = daysBetween(tripStartDate, tripEndDate);
    const currency = trip.currency;
    const dailyBudgetLimit = toNum(trip.dailyBudget) || null;

    // ── Per-stop breakdown ──────────────────────────────────────────
    let totalTransport = 0;
    let totalAccommodation = 0;
    let totalActivities = 0;
    let totalMeals = 0;

    const stopBreakdowns: StopBudget[] = [];

    // Daily accumulator: maps date string → cost categories
    const dailyMap = new Map<string, {
      transport: number;
      accommodation: number;
      activities: number;
      meals: number;
    }>();

    // Initialize daily map with all trip dates
    const allDates = getDateRange(tripStartDate, tripEndDate);
    for (const date of allDates) {
      dailyMap.set(date, { transport: 0, accommodation: 0, activities: 0, meals: 0 });
    }

    for (const stop of trip.stops) {
      const stopDays = daysBetween(new Date(stop.startDate), new Date(stop.endDate));
      const costIndex = toNum(stop.city.costIndex);

      // Stop-level costs
      const stopTransport = toNum(stop.transportCost);
      const stopAccommodation = toNum(stop.accommodationCost);

      // Activity costs for this stop
      let stopActivitiesCost = 0;
      const activityDetails: StopBudget['activityDetails'] = [];

      for (const sa of stop.activities) {
        const actCost = toNum(sa.cost);
        stopActivitiesCost += actCost;

        activityDetails.push({
          name: sa.activity.name,
          type: sa.activity.type,
          cost: actCost,
          scheduledTime: sa.scheduledTime.toISOString(),
        });

        // Distribute activity cost to its scheduled day
        const actDate = toDateStr(new Date(sa.scheduledTime));
        const entry = dailyMap.get(actDate);
        if (entry) {
          entry.activities += actCost;
        }
      }

      // Meal estimate: days × costIndex × base rate × meals/day
      const stopMeals = stopDays * costIndex * BASE_MEAL_RATE * MEALS_PER_DAY;

      // Accumulate totals
      totalTransport += stopTransport;
      totalAccommodation += stopAccommodation;
      totalActivities += stopActivitiesCost;
      totalMeals += stopMeals;

      stopBreakdowns.push({
        stopId: stop.id,
        cityName: stop.city.name,
        country: stop.city.country,
        days: stopDays,
        transport: stopTransport,
        accommodation: stopAccommodation,
        activities: stopActivitiesCost,
        meals: Math.round(stopMeals * 100) / 100,
        activityDetails,
      });

      // Distribute transport cost to the first day of the stop
      const firstStopDate = toDateStr(new Date(stop.startDate));
      const firstEntry = dailyMap.get(firstStopDate);
      if (firstEntry) {
        firstEntry.transport += stopTransport;
      }

      // Distribute accommodation evenly across stop days
      const dailyAccommodation = stopAccommodation / stopDays;
      const stopDates = getDateRange(new Date(stop.startDate), new Date(stop.endDate));
      for (const d of stopDates) {
        const entry = dailyMap.get(d);
        if (entry) {
          entry.accommodation += dailyAccommodation;
        }
      }

      // Distribute meals evenly across stop days
      const dailyMealCost = stopMeals / stopDays;
      for (const d of stopDates) {
        const entry = dailyMap.get(d);
        if (entry) {
          entry.meals += dailyMealCost;
        }
      }
    }

    // ── Compute "Other" (contingency) ────────────────────────────────
    const subtotal = totalTransport + totalAccommodation + totalActivities + totalMeals;
    const totalOther = Math.round(subtotal * CONTINGENCY_RATE * 100) / 100;
    const grandTotal = Math.round((subtotal + totalOther) * 100) / 100;

    // ── Build daily breakdowns ───────────────────────────────────────
    let overBudgetDays = 0;
    const dailyBreakdowns: DailyBudget[] = allDates.map((date) => {
      const entry = dailyMap.get(date)!;
      const dayTotal =
        Math.round((entry.transport + entry.accommodation + entry.activities + entry.meals) * 100) / 100;
      const isOverBudget = dailyBudgetLimit !== null && dayTotal > dailyBudgetLimit;
      if (isOverBudget) overBudgetDays++;

      return {
        date,
        transport: Math.round(entry.transport * 100) / 100,
        accommodation: Math.round(entry.accommodation * 100) / 100,
        activities: Math.round(entry.activities * 100) / 100,
        meals: Math.round(entry.meals * 100) / 100,
        total: dayTotal,
        isOverBudget,
      };
    });

    // ── Build result ─────────────────────────────────────────────────
    const calculatedAt = new Date().toISOString();

    const breakdown: BudgetBreakdown = {
      tripId,
      currency,
      dailyBudgetLimit,
      totalDays,
      categoryTotals: {
        transport: Math.round(totalTransport * 100) / 100,
        accommodation: Math.round(totalAccommodation * 100) / 100,
        activities: Math.round(totalActivities * 100) / 100,
        meals: Math.round(totalMeals * 100) / 100,
        other: totalOther,
        grandTotal,
      },
      stopBreakdowns,
      dailyBreakdowns,
      overBudgetDays,
      calculatedAt,
    };

    // ── Upsert BudgetEstimate record ─────────────────────────────────
    try {
      await prisma.budgetEstimate.upsert({
        where: { tripId },
        create: {
          tripId,
          totalTransport: breakdown.categoryTotals.transport,
          totalAccommodation: breakdown.categoryTotals.accommodation,
          totalActivities: breakdown.categoryTotals.activities,
          totalMeals: breakdown.categoryTotals.meals,
          totalOther: breakdown.categoryTotals.other,
          currency,
          calculatedAt: new Date(calculatedAt),
        },
        update: {
          totalTransport: breakdown.categoryTotals.transport,
          totalAccommodation: breakdown.categoryTotals.accommodation,
          totalActivities: breakdown.categoryTotals.activities,
          totalMeals: breakdown.categoryTotals.meals,
          totalOther: breakdown.categoryTotals.other,
          currency,
          calculatedAt: new Date(calculatedAt),
        },
      });
    } catch (err) {
      // Non-critical: log but don't fail the request
      logger.warn(`Failed to upsert BudgetEstimate for trip ${tripId}: ${err}`);
    }

    // ── Cache the result ─────────────────────────────────────────────
    await cacheSet(cacheKey, JSON.stringify(breakdown), BUDGET_CACHE_TTL);

    logger.info(`Budget computed for trip ${tripId}: ${currency} ${grandTotal}`);
    return breakdown;
  }

  /**
   * Get a flattened day-wise timeline for calendar integration.
   * Returns events (activities + stop background events).
   */
  async getTimeline(tripId: string, userId: string): Promise<TimelineEvent[]> {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          orderBy: { orderIndex: 'asc' },
          include: {
            city: true,
            activities: {
              include: { activity: true },
              orderBy: { scheduledTime: 'asc' },
            },
          },
        },
      },
    });

    if (!trip) {
      throw ApiError.notFound('Trip');
    }

    if (trip.userId !== userId) {
      throw ApiError.forbidden('You do not have access to this trip');
    }

    const events: TimelineEvent[] = [];

    for (const stop of trip.stops) {
      // Add stop as a background event (all-day range)
      events.push({
        id: `stop-${stop.id}`,
        title: `📍 ${stop.city.name}, ${stop.city.country}`,
        start: new Date(stop.startDate).toISOString(),
        end: new Date(stop.endDate).toISOString(),
        type: 'stop',
        stopId: stop.id,
        cityName: stop.city.name,
        cost: toNum(stop.transportCost) + toNum(stop.accommodationCost),
        notes: stop.notes,
        durationHours: daysBetween(new Date(stop.startDate), new Date(stop.endDate)) * 24,
      });

      // Add each activity as a timed event
      for (const sa of stop.activities) {
        const startTime = new Date(sa.scheduledTime);
        const durationHours = toNum(sa.activity.durationHours);
        const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

        events.push({
          id: sa.id,
          title: sa.activity.name,
          start: startTime.toISOString(),
          end: endTime.toISOString(),
          type: 'activity',
          activityType: sa.activity.type,
          stopId: stop.id,
          cityName: stop.city.name,
          cost: toNum(sa.cost),
          notes: sa.notes,
          durationHours,
        });
      }
    }

    return events;
  }

  /**
   * Invalidate the budget cache for a trip.
   * Called by stops/activities services when data changes.
   */
  async invalidateCache(tripId: string): Promise<void> {
    await cacheDelete(`trip:${tripId}:budget`);
  }
}

export const budgetService = new BudgetService();
