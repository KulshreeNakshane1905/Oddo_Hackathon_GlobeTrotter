import { apiSlice } from './apiSlice';
import { User } from '../../types/user.types';
import { City } from '../../types/city.types';

export interface SavedCity extends City {}

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<User, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    updateMe: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: '/users/me',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    deleteMe: builder.mutation<void, void>({
      query: () => ({
        url: '/users/me',
        method: 'DELETE',
      }),
    }),
    getSavedCities: builder.query<SavedCity[], void>({
      query: () => '/users/me/saved-cities',
      providesTags: ['SavedCities'],
    }),
    saveCity: builder.mutation<SavedCity, string>({
      query: (cityId) => ({
        url: '/users/me/saved-cities',
        method: 'POST',
        body: { cityId },
      }),
      invalidatesTags: ['SavedCities'],
    }),
    unsaveCity: builder.mutation<void, string>({
      query: (cityId) => ({
        url: `/users/me/saved-cities/${cityId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SavedCities'],
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useDeleteMeMutation,
  useGetSavedCitiesQuery,
  useSaveCityMutation,
  useUnsaveCityMutation,
} = usersApi;
