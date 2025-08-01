/**
 * High-performance auth hook with TanStack Query integration
 * Provides instant state updates and seamless authentication experience
 */

'use client';

import { apiClient } from '@/lib/api-client';
import { authCacheManager } from '@/lib/auth-cache-manager';
import { useAuthActions, useAuthState } from '@/store/auth-store';
import type { UseAuthReturn } from '@/types/auth';
import { AUTH_CONFIG, AUTH_QUERY_KEYS } from '@/types/auth';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Checks if access token exists in cookies
 * Used to determine if we should attempt to fetch user data
 * Returns false during SSR to prevent hydration mismatches
 */
const hasAccessToken = (): boolean => {
  if (typeof window === 'undefined') return false;
  return document.cookie.includes('accessToken=');
};

/**
 * Main auth hook that combines Zustand store with TanStack Query
 * Provides optimized caching and instant state updates
 */
export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, error } = useAuthState();
  const { setUser, clearUser, setLoading, setError, clearError } = useAuthActions();
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration issues by only checking tokens after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Only fetch user data if we have an access token and are mounted
  const shouldFetchUser = isMounted && hasAccessToken();

  // TanStack Query for user data with optimized caching
  const {
    data: userData,
    error: queryError,
    isLoading: isQueryLoading,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: () => apiClient.getCurrentUser(),
    enabled: shouldFetchUser && !isAuthenticated, // Only fetch if needed
    staleTime: AUTH_CONFIG.staleTime, // 15 minutes - longer than token expiry
    gcTime: AUTH_CONFIG.gcTime, // 2 hours
    retry: AUTH_CONFIG.retryAttempts,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  });

  // Handle query state changes
  useEffect(() => {
    if (isSuccess && userData?.data) {
      // Update store with fresh user data
      setUser(userData.data);
      setLoading(false);
    } else if (isError && queryError) {
      // Handle auth errors
      if (queryError.statusCode === 401) {
        clearUser();
      } else {
        setError(queryError.message || 'Authentication failed');
      }
      setLoading(false);
    } else if (!shouldFetchUser && !isAuthenticated) {
      // No token and not authenticated - clear any stale state
      clearUser();
      setLoading(false);
    }
  }, [
    isSuccess,
    isError,
    userData,
    queryError,
    shouldFetchUser,
    isAuthenticated,
    setUser,
    clearUser,
    setError,
    setLoading,
  ]);

  // Optimistic login function with cache updates
  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      try {
        setLoading(true);
        clearError();

        // Call login API
        const response = await apiClient.login(credentials.email, credentials.password);
        const userData = response?.data?.user || response?.user;

        if (userData) {
          // Immediately update store for instant UI updates
          setUser(userData);

          // Use cache manager for smart cache handling
          authCacheManager.handleLogin(userData);

          setLoading(false);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error: any) {
        setLoading(false);
        const errorMessage = error?.message || 'Login failed. Please try again.';
        setError(errorMessage);
        throw error; // Re-throw for component error handling
      }
    },
    [setLoading, clearError, setUser, setError]
  );

  // Optimistic logout function with cache cleanup
  const logout = useCallback(async () => {
    try {
      // Immediately clear state for instant UI updates
      clearUser();
      clearError();

      // Use cache manager for smart cache clearing
      authCacheManager.handleLogout();

      // Call logout API (don't wait for response)
      apiClient.logout().catch(error => {
        console.warn('Logout API failed, but local state cleared:', error);
      });

      // Silent redirect to home
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, ensure local state is cleared
      clearUser();
      clearError();
      authCacheManager.handleLogout();
    }
  }, [clearUser, clearError, router]);

  // Calculate final loading state
  const finalIsLoading = useMemo(() => {
    return isLoading || (shouldFetchUser && isQueryLoading && !isAuthenticated);
  }, [isLoading, shouldFetchUser, isQueryLoading, isAuthenticated]);

  return {
    user,
    isAuthenticated,
    isLoading: finalIsLoading,
    error,
    login,
    logout,
    clearError,
  };
}

/**
 * Lightweight auth state hook for components that only need to check auth status
 * Optimized for minimal re-renders
 */
export function useAuthStatus() {
  return useAuthState();
}

/**
 * Hook for components that need user data but not auth actions
 * Prevents unnecessary re-renders when actions change
 */
export function useCurrentUser() {
  const { user, isAuthenticated } = useAuthState();
  return { user, isAuthenticated };
}
