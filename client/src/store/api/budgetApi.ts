// ============================================================================
// RTK Query — Budget & Timeline API Endpoints
// ============================================================================

import { apiSlice } from './apiSlice';
import type { BudgetBreakdown, TimelineEvent } from '../../types/budget.types';

interface BudgetResponse {
  success: true;
  data: BudgetBreakdown;
}

interface TimelineResponse {
  success: true;
  data: TimelineEvent[];
}

export const budgetApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /trips/:id/budget — Full budget breakdown
     */
    getTripBudget: builder.query<BudgetBreakdown, string>({
      query: (tripId) => `/trips/${tripId}/budget`,
      transformResponse: (response: BudgetResponse) => response.data,
      providesTags: (_result, _error, tripId) => [
        { type: 'Budget', id: tripId },
        { type: 'Trip', id: tripId },
      ],
    }),

    /**
     * GET /trips/:id/timeline — Flattened timeline events
     */
    getTripTimeline: builder.query<TimelineEvent[], string>({
      query: (tripId) => `/trips/${tripId}/timeline`,
      transformResponse: (response: TimelineResponse) => response.data,
      providesTags: (_result, _error, tripId) => [
        { type: 'Trip', id: tripId },
      ],
    }),
  }),
});

export const {
  useGetTripBudgetQuery,
  useGetTripTimelineQuery,
} = budgetApi;
