// ============================================================================
// RTK Query — Cities API Endpoints
// ============================================================================

import { apiSlice } from './apiSlice';
import type { City } from '../../types/city.types';

interface CitiesResponse {
  success: true;
  data: City[];
}

export const citiesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /cities/popular — Get popular cities (public, cached)
     */
    getPopularCities: builder.query<City[], number | void>({
      query: (limit) => `/cities/popular${limit ? `?limit=${limit}` : ''}`,
      transformResponse: (response: CitiesResponse) => response.data,
      providesTags: [{ type: 'Cities', id: 'POPULAR' }],
    }),

    /**
     * GET /cities/search — Search cities by name
     */
    searchCities: builder.query<City[], { q: string; country?: string; limit?: number }>({
      query: ({ q, country, limit }) => {
        const params = new URLSearchParams({ q });
        if (country) params.set('country', country);
        if (limit) params.set('limit', String(limit));
        return `/cities/search?${params.toString()}`;
      },
      transformResponse: (response: CitiesResponse) => response.data,
    }),
  }),
});

export const {
  useGetPopularCitiesQuery,
  useSearchCitiesQuery,
  useLazySearchCitiesQuery,
} = citiesApi;
