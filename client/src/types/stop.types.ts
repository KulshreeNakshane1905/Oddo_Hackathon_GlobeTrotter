// ============================================================================
// Type Definitions — Stop Inputs
// ============================================================================

export interface CreateStopInput {
  cityId: string;
  startDate: string;
  endDate: string;
  notes?: string;
  transportCost?: number;
  accommodationCost?: number;
}

export interface UpdateStopInput {
  cityId?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
  transportCost?: number | null;
  accommodationCost?: number | null;
}

export interface ReorderStopsInput {
  orderedIds: string[];
}
