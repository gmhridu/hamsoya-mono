import { toastService } from '@/lib/toast-service';
import type { AuthStore, User } from '@/types/auth';
import { AUTH_STORAGE_KEYS } from '@/types/auth';
import { useMemo } from 'react';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';

/**
 * Enhanced Zustand auth store with persistence and optimistic updates
 * Provides instant state updates and seamless auth state management
 */

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Actions with optimistic updates
        setUser: user =>
          set({
            user,
            isAuthenticated: !!user,
            error: null,
            isLoading: false,
          }),

        clearUser: () =>
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          }),

        setLoading: isLoading => set({ isLoading }),

        setError: error => set({ error, isLoading: false }),

        clearError: () => set({ error: null }),

        login: user => {
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Show login success toast
          if (typeof window !== 'undefined') {
            toastService.auth.loginSuccess();
          }
        },

        logout: () => {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          // Show logout success toast
          if (typeof window !== 'undefined') {
            toastService.auth.logoutSuccess();
          }
        },

        updateProfile: updates => {
          const currentUser = get().user;
          if (currentUser) {
            set({
              user: { ...currentUser, ...updates },
            });
          }
        },
      }),
      {
        name: AUTH_STORAGE_KEYS.user,
        partialize: state => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
        version: 1,
        migrate: (persistedState: any) => {
          // Handle migration if needed
          return persistedState;
        },
      }
    )
  )
);

/**
 * Direct store access for non-React contexts (like API client)
 * Provides imperative API for auth state management outside components
 */
export const authStore = {
  getState: () => useAuthStore.getState(),
  setState: useAuthStore.setState,
  subscribe: useAuthStore.subscribe,

  // Direct action accessors with proper typing
  setUser: (user: User | null) => useAuthStore.getState().setUser(user),
  clearUser: () => useAuthStore.getState().clearUser(),
  setLoading: (loading: boolean) => useAuthStore.getState().setLoading(loading),
  setError: (error: string | null) => useAuthStore.getState().setError(error),
  clearError: () => useAuthStore.getState().clearError(),
  login: (user: User) => useAuthStore.getState().login(user),
  logout: () => useAuthStore.getState().logout(),
  updateProfile: (updates: Partial<User>) => useAuthStore.getState().updateProfile(updates),
};

/**
 * Optimized selectors for better performance and minimal re-renders
 * Use these instead of accessing the full store to prevent unnecessary updates
 */
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);

/**
 * Auth actions hook with memoized actions to prevent infinite re-renders
 * Returns stable references to auth actions for use in components
 */
export const useAuthActions = () => {
  const setUser = useAuthStore(state => state.setUser);
  const clearUser = useAuthStore(state => state.clearUser);
  const setLoading = useAuthStore(state => state.setLoading);
  const setError = useAuthStore(state => state.setError);
  const clearError = useAuthStore(state => state.clearError);
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);
  const updateProfile = useAuthStore(state => state.updateProfile);

  return useMemo(
    () => ({
      setUser,
      clearUser,
      setLoading,
      setError,
      clearError,
      login,
      logout,
      updateProfile,
    }),
    [setUser, clearUser, setLoading, setError, clearError, login, logout, updateProfile]
  );
};

/**
 * Helper hooks for role-based access control and user status checks
 * Provide convenient access to user permissions and verification status
 */
export const useIsAdmin = () => {
  const user = useUser();
  return user?.role === 'ADMIN';
};

export const useIsSeller = () => {
  const user = useUser();
  return user?.role === 'SELLER' || user?.role === 'ADMIN';
};

export const useIsVerified = () => {
  const user = useUser();
  return user?.is_verified ?? false;
};

/**
 * Composite auth state selector for components that need multiple auth values
 * Uses individual selectors to prevent infinite loops and optimize performance
 */
export const useAuthState = () => {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);

  return useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      error,
    }),
    [user, isAuthenticated, isLoading, error]
  );
};
