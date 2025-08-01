'use client';

import { useServerAuth } from '@/components/providers/server-auth-provider';
import { useAuthStore } from '@/store/auth-store';
import { useEffect, useLayoutEffect } from 'react';

/**
 * Auth Sync Component
 * Syncs server-side authentication data with client-side stores
 * Uses useLayoutEffect to sync immediately before paint to prevent flicker
 * Now includes bidirectional sync for complete state consistency
 */
export function AuthSync() {
  const { user, isAuthenticated, updateUser, clearAuth } = useServerAuth();
  const {
    setUser,
    clearUser,
    setLoading,
    user: storeUser,
    isAuthenticated: storeIsAuthenticated,
  } = useAuthStore();

  // Use useLayoutEffect to sync server-side auth data with client-side store immediately
  useLayoutEffect(() => {
    // Sync server-side auth data with client-side store immediately
    if (isAuthenticated && user) {
      setUser(user);
    } else {
      clearUser();
    }

    // Mark as not loading since we have server-side data
    setLoading(false);
  }, [user, isAuthenticated, setUser, clearUser, setLoading]);

  // Listen for client-side auth changes and sync back to server provider
  useEffect(() => {
    // If store state differs from server state, update server state
    if (storeIsAuthenticated !== isAuthenticated || storeUser !== user) {
      if (storeIsAuthenticated && storeUser) {
        updateUser(storeUser);
      } else {
        clearAuth();
      }
    }
  }, [storeUser, storeIsAuthenticated, user, isAuthenticated, updateUser, clearAuth]);

  return null; // This component doesn't render anything
}
