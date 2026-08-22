// ============================================================================
// RTK Query — Activities API Endpoints
// ============================================================================

import { apiSlice } from './apiSlice';
import type { StopActivityWithDetail } from '../../types/trip.types';
import type {
  Activity,
  AddActivityInput,
  UpdateStopActivityInput,
  ActivitySearchParams,
} from '../../types/activity.types';

interface StopActivityResponse {
  success: true;
  data: StopActivityWithDetail;
}

interface ActivitiesSearchResponse {
  success: true;
  data: Activity[];
}

export const activitiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * POST /stops/:stopId/activities — Add activity to a stop
     */
    addActivityToStop: builder.mutation<
      StopActivityWithDetail,
      { stopId: string; tripId: string; data: AddActivityInput }
    >({
      query: ({ stopId, data }) => ({
        url: `/stops/${stopId}/activities`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: StopActivityResponse) => response.data,
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: 'Trip', id: tripId },
      ],
    }),

    /**
     * PUT /stop-activities/:id — Update a stop activity
     */
    updateStopActivity: builder.mutation<
      StopActivityWithDetail,
      { id: string; tripId: string; data: UpdateStopActivityInput }
    >({
      query: ({ id, data }) => ({
        url: `/stop-activities/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: StopActivityResponse) => response.data,
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: 'Trip', id: tripId },
      ],
    }),

    /**
     * DELETE /stop-activities/:id — Remove activity from stop
     */
    removeStopActivity: builder.mutation<void, { id: string; tripId: string }>({
      query: ({ id }) => ({
        url: `/stop-activities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: 'Trip', id: tripId },
      ],
    }),

    /**
     * GET /activities/search — Search activities with filters
     */
    searchActivities: builder.query<Activity[], ActivitySearchParams>({
      query: ({ q, type, cityId, maxCost, maxDuration, limit }) => {
        const params = new URLSearchParams({ q });
        if (type) params.set('type', type);
        if (cityId) params.set('cityId', cityId);
        if (maxCost !== undefined) params.set('maxCost', String(maxCost));
        if (maxDuration !== undefined) params.set('maxDuration', String(maxDuration));
        if (limit) params.set('limit', String(limit));
        return `/activities/search?${params.toString()}`;
      },
      transformResponse: (response: ActivitiesSearchResponse) => response.data,
      providesTags: [{ type: 'Activity', id: 'SEARCH' }],
    }),
  }),
});

export const {
  useAddActivityToStopMutation,
  useUpdateStopActivityMutation,
  useRemoveStopActivityMutation,
  useSearchActivitiesQuery,
  useLazySearchActivitiesQuery,
} = activitiesApi;
