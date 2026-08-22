// ============================================================================
// useAuth Hook — Authentication utilities
// ============================================================================

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { setCredentials, logout as logoutAction, setLoading } from '../store/slices/authSlice';
import { showSnackbar } from '../store/slices/uiSlice';
import { supabase } from '../utils/supabaseClient';
import type { User } from '../types/user.types';
import { API_BASE_URL } from '../utils/constants';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading, accessToken } = useSelector(
    (state: RootState) => state.auth
  );

  const login = useCallback(
    async (email: string, password: string) => {
      dispatch(setLoading(true));
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || 'Login failed');
        }

        dispatch(
          setCredentials({
            user: data.data.user as User,
            accessToken: data.data.session.accessToken,
            refreshToken: data.data.session.refreshToken,
          })
        );

        dispatch(showSnackbar({ message: 'Welcome back! 🌍', severity: 'success' }));
        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        dispatch(showSnackbar({ message, severity: 'error' }));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      dispatch(setLoading(true));
      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, fullName }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error?.message || 'Registration failed');
        }

        dispatch(
          showSnackbar({
            message: 'Account created! Please log in. ✈️',
            severity: 'success',
          })
        );
        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        dispatch(showSnackbar({ message, severity: 'error' }));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const forgotPassword = useCallback(
    async (email: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        dispatch(
          showSnackbar({
            message: data.data?.message || 'If the email exists, a reset link has been sent.',
            severity: 'info',
          })
        );
      } catch {
        dispatch(
          showSnackbar({
            message: 'If the email exists, a reset link has been sent.',
            severity: 'info',
          })
        );
      }
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
    } catch {
      // Continue with local logout even if Supabase fails
    }

    dispatch(logoutAction());
    dispatch(showSnackbar({ message: 'Logged out successfully', severity: 'info' }));
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    login,
    register,
    forgotPassword,
    logout,
  };
}
