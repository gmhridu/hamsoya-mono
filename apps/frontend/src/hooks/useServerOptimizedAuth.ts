/**
 * Server-Optimized Authentication Hook
 * Prevents unnecessary client-side API calls when server state is available
 * Provides seamless authentication state management
 */

'use client';

import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';

/**
 * Hook that provides authentication state optimized for server-side hydration
 * Prevents unnecessary API calls when server state is already available
 */
export function useServerOptimizedAuth() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading: !isHydrated || isLoading,
    isHydrated,
    // Prevent API calls if we already have server-validated data
    shouldFetchUser: isHydrated && !isAuthenticated && !isLoading,
  };
}

/**
 * Hook that determines if client-side authentication calls should be made
 * Returns false if server state is already available
 */
export function useShouldFetchAuth() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Don't fetch if:
  // 1. Not hydrated yet (server state might be coming)
  // 2. Already authenticated (server provided valid state)
  // 3. Currently loading
  return isHydrated && !isAuthenticated && !isLoading;
}

/**
 * Hook for conditional API calls based on server state availability
 */
export function useConditionalAuth() {
  const authState = useServerOptimizedAuth();
  const shouldFetch = useShouldFetchAuth();

  return {
    ...authState,
    shouldFetch,
    // Helper to conditionally enable queries
    enableQuery: shouldFetch,
  };
}
