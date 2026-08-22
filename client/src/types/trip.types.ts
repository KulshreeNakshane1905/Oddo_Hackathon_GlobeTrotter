// ============================================================================
// Type Definitions — Trip
// ============================================================================

export interface Trip {
  id: string;
  tripName: string;
  description: string;
  startDate: string;
  endDate: string;
  coverPhotoUrl: string | null;
  isPublic: boolean;
  shareToken: string | null;
  dailyBudget: number | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    stops: number;
  };
}

export interface TripWithStops extends Trip {
  stops: TripStop[];
  budgetEstimate: BudgetEstimate | null;
}

export interface TripStop {
  id: string;
  tripId: string;
  cityId: string;
  orderIndex: number;
  startDate: string;
  endDate: string;
  notes: string | null;
  transportCost: number | null;
  accommodationCost: number | null;
  city: {
    id: string;
    name: string;
    country: string;
    countryCode: string;
    costIndex: number;
    imageUrl: string | null;
  };
  activities: StopActivityWithDetail[];
}

export interface StopActivityWithDetail {
  id: string;
  stopId: string;
  activityId: string;
  scheduledTime: string;
  cost: number;
  notes: string | null;
  activity: {
    id: string;
    name: string;
    description: string | null;
    type: string;
    avgCost: number;
    durationHours: number;
    imageUrl: string | null;
  };
}

export interface BudgetEstimate {
  id: string;
  tripId: string;
  totalTransport: number;
  totalAccommodation: number;
  totalActivities: number;
  totalMeals: number;
  totalOther: number;
  currency: string;
  calculatedAt: string;
}

export interface CreateTripInput {
  tripName: string;
  description?: string;
  startDate: string;
  endDate: string;
  coverPhotoUrl?: string;
  dailyBudget?: number;
  currency?: string;
}

export interface UpdateTripInput {
  tripName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  coverPhotoUrl?: string | null;
  isPublic?: boolean;
  dailyBudget?: number | null;
  currency?: string;
}

export interface TripListParams {
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'startDate' | 'tripName' | 'updatedAt';
  order?: 'asc' | 'desc';
  upcoming?: boolean;
}
