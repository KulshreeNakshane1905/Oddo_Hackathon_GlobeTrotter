// ============================================================================
// RTK Query — Base API Configuration
// ============================================================================

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../utils/constants';
import type { RootState } from '../store.ts';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Attach JWT from auth state
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Trip', 'Trips', 'Stop', 'Activity', 'Budget', 'Cities', 'User', 'Admin', 'SavedCities'],
  endpoints: () => ({}),
});
