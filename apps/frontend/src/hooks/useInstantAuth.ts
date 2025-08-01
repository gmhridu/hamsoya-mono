/**
 * Instant authentication state detection for professional-grade UX
 * Provides immediate auth state without delays or flashing
 */

'use client';

import { useAuthStore } from '@/store/auth-store';
import { useEffect, useState } from 'react';

/**
 * Checks if access token exists in cookies synchronously
 * This provides instant auth state detection without API calls
 */
function hasAccessTokenSync(): boolean {
  if (typeof window === 'undefined') return false;
  return document.cookie.includes('accessToken=');
}

/**
 * Hook for instant authentication state detection
 * Combines persisted auth state with token presence for immediate decisions
 */
export function useInstantAuth() {
  const { user, isAuthenticated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // During SSR, assume not authenticated to prevent hydration issues
  if (!isMounted) {
    return {
      isAuthenticated: false,
      hasValidSession: false,
      shouldRedirect: false,
      user: null,
    };
  }

  // Check if we have both persisted auth state AND valid token
  const hasToken = hasAccessTokenSync();
  const hasValidSession = isAuthenticated && hasToken;

  return {
    isAuthenticated: hasValidSession,
    hasValidSession,
    shouldRedirect: hasValidSession,
    user: hasValidSession ? user : null,
  };
}

/**
 * Hook specifically for guest-only routes (login, register, etc.)
 * Provides instant redirect decision without waiting for API calls
 */
export function useGuestOnlyAuth() {
  const { isAuthenticated, hasValidSession, shouldRedirect } = useInstantAuth();

  return {
    shouldShowContent: !shouldRedirect,
    shouldRedirect,
    isAuthenticated,
    hasValidSession,
  };
}

/**
 * Hook specifically for protected routes
 * Provides instant access control decisions
 */
export function useProtectedAuth() {
  const { isAuthenticated, hasValidSession, user } = useInstantAuth();

  return {
    shouldShowContent: hasValidSession,
    shouldRedirect: !hasValidSession,
    isAuthenticated,
    user,
  };
}

/**
 * Hook for components that need to make instant auth-based decisions
 * without causing re-renders or delays
 */
export function useAuthDecision() {
  const { isAuthenticated, hasValidSession } = useInstantAuth();

  return {
    isAuthenticated: hasValidSession,
    isGuest: !hasValidSession,
    canAccessProtected: hasValidSession,
    canAccessGuest: !hasValidSession,
  };
}
