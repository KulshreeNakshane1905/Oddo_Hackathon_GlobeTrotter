import { apiSlice } from './apiSlice';
import type {  Trip, TripWithStops  } from '../../types/trip.types';

export interface ShareResponse {
  token: string;
}

export const sharingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    shareTrip: builder.mutation<ShareResponse, string>({
      query: (tripId) => ({
        url: `/trips/${tripId}/share`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Trip', id: arg }],
    }),
    unshareTrip: builder.mutation<void, string>({
      query: (tripId) => ({
        url: `/trips/${tripId}/share`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Trip', id: arg }],
    }),
    getPublicTrip: builder.query<TripWithStops & { user?: { fullName: string; profilePic: string | null } }, string>({
      query: (token) => `/public/trip/${token}`,
    }),
    copyTrip: builder.mutation<Trip, string>({
      query: (token) => ({
        url: `/public/trip/${token}/copy`,
        method: 'POST',
      }),
      invalidatesTags: ['Trip'],
    }),
  }),
});

export const {
  useShareTripMutation,
  useUnshareTripMutation,
  useGetPublicTripQuery,
  useCopyTripMutation,
} = sharingApi;
