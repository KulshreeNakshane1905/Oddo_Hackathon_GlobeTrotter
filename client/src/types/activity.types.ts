// ============================================================================
// Type Definitions — Activity
// ============================================================================

export type ActivityType =
  | 'SIGHTSEEING'
  | 'FOOD'
  | 'ADVENTURE'
  | 'CULTURE'
  | 'NIGHTLIFE'
  | 'SHOPPING'
  | 'NATURE'
  | 'TRANSPORT'
  | 'OTHER';

export interface Activity {
  id: string;
  cityId: string | null;
  name: string;
  description: string | null;
  type: ActivityType;
  avgCost: number;
  durationHours: number;
  imageUrl: string | null;
  createdAt: string;
  city?: {
    id: string;
    name: string;
    country: string;
  } | null;
}

export interface AddActivityInput {
  activityId: string;
  scheduledTime: string;
  cost?: number;
  notes?: string;
}

export interface UpdateStopActivityInput {
  scheduledTime?: string;
  cost?: number;
  notes?: string;
}

export interface ActivitySearchParams {
  q: string;
  type?: ActivityType;
  cityId?: string;
  maxCost?: number;
  maxDuration?: number;
  limit?: number;
}
