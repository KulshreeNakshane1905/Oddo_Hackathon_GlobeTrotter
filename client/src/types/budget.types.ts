// ============================================================================
// Type Definitions — Budget & Timeline
// ============================================================================

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

// ── Chart-specific mapped types ─────────────────────────────────────────────

/** Budget categories used for chart legends and color mapping */
export type BudgetCategory = 'transport' | 'accommodation' | 'activities' | 'meals' | 'other';

/** Color map for consistent budget category colors across charts */
export const BUDGET_CATEGORY_COLORS: Record<BudgetCategory, string> = {
  transport: '#38BDF8',      // Sky blue
  accommodation: '#6C63FF',  // Primary violet
  activities: '#FF6B6B',     // Coral
  meals: '#FFB020',          // Amber
  other: '#9CA3C0',          // Muted grey
};

/** Human-readable labels for budget categories */
export const BUDGET_CATEGORY_LABELS: Record<BudgetCategory, string> = {
  transport: 'Transport',
  accommodation: 'Accommodation',
  activities: 'Activities',
  meals: 'Meals',
  other: 'Other',
};

/** Color map for activity types (used in calendar) */
export const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  SIGHTSEEING: '#6C63FF',
  FOOD: '#FFB020',
  ADVENTURE: '#FF6B6B',
  CULTURE: '#00D9A6',
  NIGHTLIFE: '#E040FB',
  SHOPPING: '#38BDF8',
  NATURE: '#66BB6A',
  TRANSPORT: '#78909C',
  OTHER: '#9CA3C0',
};
