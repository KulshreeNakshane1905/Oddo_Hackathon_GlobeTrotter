// ============================================================================
// Auth Slice — Authentication state management
// ============================================================================

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/user.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Attempt to restore session from localStorage
const storedToken = localStorage.getItem('gt_access_token');
const storedRefreshToken = localStorage.getItem('gt_refresh_token');
const storedUser = localStorage.getItem('gt_user');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: storedToken,
  refreshToken: storedRefreshToken,
  isAuthenticated: !!storedToken,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      // Persist to localStorage
      localStorage.setItem('gt_access_token', accessToken);
      localStorage.setItem('gt_refresh_token', refreshToken);
      localStorage.setItem('gt_user', JSON.stringify(user));
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('gt_user', JSON.stringify(state.user));
      }
    },

    updateTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('gt_access_token', action.payload.accessToken);
      localStorage.setItem('gt_refresh_token', action.payload.refreshToken);
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      localStorage.removeItem('gt_access_token');
      localStorage.removeItem('gt_refresh_token');
      localStorage.removeItem('gt_user');
    },
  },
});

export const { setCredentials, updateUser, updateTokens, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
