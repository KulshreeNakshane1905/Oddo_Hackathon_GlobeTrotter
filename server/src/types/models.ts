// ============================================================================
// Shared Type Definitions
// ============================================================================

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface UserPayload {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface TripCreateInput {
  tripName: string;
  description?: string;
  startDate: string;
  endDate: string;
  coverPhotoUrl?: string;
  dailyBudget?: number;
  currency?: string;
}

export interface StopCreateInput {
  cityId: string;
  startDate: string;
  endDate: string;
  notes?: string;
  orderIndex?: number;
  transportCost?: number;
  accommodationCost?: number;
}

export interface ActivityAddInput {
  activityId: string;
  scheduledTime: string;
  cost?: number;
  notes?: string;
}
