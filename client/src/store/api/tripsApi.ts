// ============================================================================
// RTK Query — Trips API Endpoints
// ============================================================================

import { apiSlice } from './apiSlice';
import type { Trip, TripWithStops, CreateTripInput, UpdateTripInput, TripListParams } from '../../types/trip.types';
import type { PaginationMeta } from '../../types/api.types';

interface TripsListResponse {
  success: true;
  data: Trip[];
  meta: PaginationMeta;
}

interface TripDetailResponse {
  success: true;
  data: TripWithStops;
}

interface TripMutationResponse {
  success: true;
  data: Trip;
}

export const tripsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /trips — List user's trips with pagination
     */
    getTrips: builder.query<
      { trips: Trip[]; meta: PaginationMeta },
      TripListParams | void
    >({
      query: (params) => {
        const p = params as TripListParams | undefined;
        const searchParams = new URLSearchParams();
        if (p?.page) searchParams.set('page', String(p.page));
        if (p?.limit) searchParams.set('limit', String(p.limit));
        if (p?.sort) searchParams.set('sort', p.sort);
        if (p?.order) searchParams.set('order', p.order);
        if (p?.upcoming) searchParams.set('upcoming', 'true');
        return `/trips?${searchParams.toString()}`;
      },
      transformResponse: (response: TripsListResponse) => ({
        trips: response.data,
        meta: response.meta,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.trips.map((trip) => ({
                type: 'Trip' as const,
                id: trip.id,
              })),
              { type: 'Trips', id: 'LIST' },
            ]
          : [{ type: 'Trips', id: 'LIST' }],
    }),

    /**
     * GET /trips/:id — Get single trip with full details
     */
    getTripById: builder.query<TripWithStops, string>({
      query: (id) => `/trips/${id}`,
      transformResponse: (response: TripDetailResponse) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Trip', id }],
    }),

    /**
     * POST /trips — Create a new trip
     */
    createTrip: builder.mutation<Trip, CreateTripInput>({
      query: (body) => ({
        url: '/trips',
        method: 'POST',
        body,
      }),
      transformResponse: (response: TripMutationResponse) => response.data,
      invalidatesTags: [{ type: 'Trips', id: 'LIST' }],
    }),

    /**
     * PUT /trips/:id — Update a trip
     */
    updateTrip: builder.mutation<Trip, { id: string; data: UpdateTripInput }>({
      query: ({ id, data }) => ({
        url: `/trips/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: TripMutationResponse) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Trip', id },
        { type: 'Trips', id: 'LIST' },
      ],
    }),

    /**
     * DELETE /trips/:id — Delete a trip
     */
    deleteTrip: builder.mutation<void, string>({
      query: (id) => ({
        url: `/trips/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Trips', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTripsQuery,
  useGetTripByIdQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useDeleteTripMutation,
} = tripsApi;
