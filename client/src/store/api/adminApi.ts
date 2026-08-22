import { apiSlice } from './apiSlice';

export interface AdminStats {
  overview: {
    totalUsers: number;
    totalTrips: number;
    publicTrips: number;
    totalActivities: number;
  };
  growth: {
    trips: string[];
    users: string[];
  };
}

export interface CityStats {
  id: string;
  name: string;
  country: string;
  popularityScore: number;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  isAdmin: boolean;
  createdAt: string;
  _count: {
    trips: number;
  };
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformStats: builder.query<AdminStats, void>({
      query: () => '/admin/stats',
      providesTags: ['Admin'] as any,
    }),
    getTopCities: builder.query<CityStats[], number | void>({
      query: (limit = 10) => `/admin/cities/top?limit=${limit}`,
      providesTags: ['Admin'] as any,
    }),
    getAllUsers: builder.query<UsersResponse, { page: number; limit: number }>({
      query: ({ page, limit }) => `/admin/users?page=${page}&limit=${limit}`,
      providesTags: ['Admin'] as any,
    }),
  }),
});

export const {
  useGetPlatformStatsQuery,
  useGetTopCitiesQuery,
  useGetAllUsersQuery,
} = adminApi;
