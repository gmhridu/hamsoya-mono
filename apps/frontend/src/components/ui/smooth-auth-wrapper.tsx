/**
 * Smooth Authentication Wrapper
 * Eliminates screen flickering during authentication state changes
 * Provides ChatGPT-style instant navigation without client-side flashing
 */

'use client';

import { useUser, useIsAuthenticated, useAuthLoading } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import { ReactNode, useEffect } from 'react';

interface SmoothAuthWrapperProps {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
  requireAuth?: boolean;
  guestOnly?: boolean;
}

/**
 * Loading skeleton for authentication states
 */
function AuthLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse space-y-4 w-full max-w-md">
        <div className="h-8 bg-muted rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
        <div className="h-4 bg-muted rounded w-5/6 mx-auto"></div>
        <div className="space-y-2 mt-8">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Smooth authentication wrapper that prevents flickering
 * Works with middleware for server-side redirects
 */
export function SmoothAuthWrapper({
  children,
  className,
  fallback,
  requireAuth = false,
  guestOnly = false,
}: SmoothAuthWrapperProps) {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();

  // Instant decision - no loading states needed with server auth
  const shouldShow = (() => {
    if (requireAuth && !isAuthenticated) return false;
    if (guestOnly && isAuthenticated) return false;
    return true;
  })();

  // If content shouldn't be shown, return fallback immediately
  if (!shouldShow) {
    return (
      <div className={cn('transition-opacity duration-200 opacity-100', className)}>
        {fallback || <AuthLoadingSkeleton />}
      </div>
    );
  }

  // Show content immediately - no transitions needed with server auth
  return <div className={cn('opacity-100', className)}>{children}</div>;
}

/**
 * Hook for smooth authentication-aware navigation
 */
export function useSmoothAuth() {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();

  return {
    user,
    isAuthenticated,
    isLoading,
    isReady: !isLoading,
  };
}

/**
 * Higher-order component for pages that need authentication
 */
export function withSmoothAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    guestOnly?: boolean;
    fallback?: ReactNode;
  } = {}
) {
  const { requireAuth = false, guestOnly = false, fallback } = options;

  return function AuthenticatedComponent(props: P) {
    return (
      <SmoothAuthWrapper requireAuth={requireAuth} guestOnly={guestOnly} fallback={fallback}>
        <Component {...props} />
      </SmoothAuthWrapper>
    );
  };
}

/**
 * Instant redirect component for client-side navigation
 * Only used when server-side redirects aren't possible
 */
export function InstantRedirect({ to }: { to: string }) {
  useEffect(() => {
    // Use window.location for instant redirect without flashing
    window.location.href = to;
  }, [to]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">
        <div className="w-8 h-8 bg-primary rounded-full"></div>
      </div>
    </div>
  );
}

export { AuthLoadingSkeleton };
