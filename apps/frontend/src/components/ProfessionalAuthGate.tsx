/**
 * Professional-grade authentication gates with zero content flashing
 * Provides instant redirects and seamless user experience like ChatGPT/Stripe
 */

'use client';

import { useGuestOnlyAuth, useProtectedAuth } from '@/hooks/useInstantAuth';
import { useRouter } from 'next/navigation';
import { useLayoutEffect } from 'react';

/**
 * Professional GuestOnlyRoute with zero flash
 * Instantly redirects authenticated users without showing content
 */
export function ProfessionalGuestOnlyRoute({
  children,
  redirectTo = '/',
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { shouldShowContent, shouldRedirect } = useGuestOnlyAuth();

  // Use useLayoutEffect for synchronous redirect before paint
  useLayoutEffect(() => {
    if (shouldRedirect) {
      router.replace(redirectTo);
    }
  }, [shouldRedirect, redirectTo, router]);

  // Don't render anything if we should redirect
  if (shouldRedirect) {
    return null;
  }

  // Only render content if we should show it
  if (!shouldShowContent) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Professional ProtectedRoute with zero flash
 * Instantly redirects unauthenticated users without showing content
 */
export function ProfessionalProtectedRoute({
  children,
  redirectTo = '/login',
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { shouldShowContent, shouldRedirect } = useProtectedAuth();

  // Use useLayoutEffect for synchronous redirect before paint
  useLayoutEffect(() => {
    if (shouldRedirect) {
      router.replace(redirectTo);
    }
  }, [shouldRedirect, redirectTo, router]);

  // Don't render anything if we should redirect
  if (shouldRedirect) {
    return null;
  }

  // Only render content if we should show it
  if (!shouldShowContent) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Instant auth decision component
 * Makes immediate decisions without waiting for API calls
 */
export function InstantAuthDecision({
  authenticated,
  unauthenticated,
}: {
  authenticated: React.ReactNode;
  unauthenticated: React.ReactNode;
}) {
  const { shouldShowContent } = useProtectedAuth();

  return <>{shouldShowContent ? authenticated : unauthenticated}</>;
}

/**
 * Zero-flash auth wrapper
 * Provides instant auth-based rendering decisions
 */
export function ZeroFlashAuth({
  children,
  fallback = null,
  requireAuth = false,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}) {
  if (requireAuth) {
    const { shouldShowContent } = useProtectedAuth();
    return shouldShowContent ? <>{children}</> : <>{fallback}</>;
  } else {
    const { shouldShowContent } = useGuestOnlyAuth();
    return shouldShowContent ? <>{children}</> : <>{fallback}</>;
  }
}
