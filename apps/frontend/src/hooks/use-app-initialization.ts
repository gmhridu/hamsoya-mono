/**
 * App Initialization Hook
 * Handles initialization of guest data and cleanup on app startup
 */

'use client';

import { useEffect } from 'react';
import { initializeGuestData } from '@/lib/guest-data-migration';
import { useAuthStore } from '@/store/auth-store';

/**
 * Hook to initialize app data on startup
 * Should be called in the root layout or main app component
 */
export function useAppInitialization() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // TODO: Clean up expired guest data on app startup
    // cleanupExpiredGuestData();

    // Initialize guest data if user is not authenticated
    if (!isAuthenticated) {
      initializeGuestData();
    }
  }, [isAuthenticated]);

  // Return initialization status (can be extended later)
  return {
    initialized: true,
  };
}
