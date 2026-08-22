// ============================================================================
// RTK Query — Stops API Endpoints
// ============================================================================

import { apiSlice } from './apiSlice';
import type { TripStop } from '../../types/trip.types';
import type { CreateStopInput, UpdateStopInput, ReorderStopsInput } from '../../types/stop.types';

interface StopMutationResponse {
  success: true;
  data: TripStop;
}

interface StopsListResponse {
  success: true;
  data: TripStop[];
}

export const stopsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * POST /trips/:tripId/stops — Add a stop to a trip
     */
    addStop: builder.mutation<TripStop, { tripId: string; data: CreateStopInput }>({
      query: ({ tripId, data }) => ({
        url: `/trips/${tripId}/stops`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: StopMutationResponse) => response.data,
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: 'Trip', id: tripId },
        { type: 'Trips', id: 'LIST' },
      ],
    }),

    /**
     * PUT /stops/:id — Update a stop
     */
    updateStop: builder.mutation<TripStop, { id: string; tripId: string; data: UpdateStopInput }>({
      query: ({ id, data }) => ({
        url: `/stops/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: StopMutationResponse) => response.data,
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: 'Trip', id: tripId },
      ],
    }),

    /**
     * DELETE /stops/:id — Remove a stop
     */
    deleteStop: builder.mutation<void, { id: string; tripId: string }>({
      query: ({ id }) => ({
        url: `/stops/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: 'Trip', id: tripId },
        { type: 'Trips', id: 'LIST' },
      ],
    }),

    /**
     * PATCH /trips/:tripId/stops/reorder — Batch reorder stops
     */
    reorderStops: builder.mutation<TripStop[], { tripId: string; data: ReorderStopsInput }>({
      query: ({ tripId, data }) => ({
        url: `/trips/${tripId}/stops/reorder`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: StopsListResponse) => response.data,
      invalidatesTags: (_result, _error, { tripId }) => [
        { type: 'Trip', id: tripId },
      ],
    }),
  }),
});

export const {
  useAddStopMutation,
  useUpdateStopMutation,
  useDeleteStopMutation,
  useReorderStopsMutation,
} = stopsApi;
