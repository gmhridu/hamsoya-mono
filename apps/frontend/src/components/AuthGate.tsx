/**
 * Professional-grade authentication gate with zero content flashing
 * Provides instant redirects and seamless user experience
 */

'use client';

import { useServerAuth } from '@/components/providers/server-auth-provider';
import type { AuthGateProps } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useMemo, useEffect } from 'react';

/**
 * AuthGate component for controlling access to routes based on authentication state
 * Features:
 * - Zero loading states for instant UX
 * - Silent redirects using router.replace()
 * - Optimistic rendering based on auth state
 * - Flexible configuration for different use cases
 */
export function AuthGate({
  children,
  requireAuth = false,
  requireGuest = false,
  redirectTo,
  fallback = null,
  className,
}: AuthGateProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useServerAuth();

  // Determine redirect paths based on props and auth state
  const redirectPath = useMemo(() => {
    if (redirectTo) return redirectTo;

    if (requireAuth && !isAuthenticated) {
      return '/login';
    }

    if (requireGuest && isAuthenticated) {
      return '/';
    }

    return null;
  }, [requireAuth, requireGuest, isAuthenticated, redirectTo]);

  // Handle redirects with silent navigation immediately
  if (redirectPath && !isLoading) {
    // Use replace to prevent back button issues
    router.replace(redirectPath);
    return null; // Don't render anything while redirecting
  }

  // Determine if we should render children
  const shouldRender = useMemo(() => {
    // Since we have server-side data, no loading states needed
    // Requires auth but user is not authenticated
    if (requireAuth && !isAuthenticated) return false;

    // Requires guest but user is authenticated
    if (requireGuest && isAuthenticated) return false;

    // All conditions met
    return true;
  }, [requireAuth, requireGuest, isAuthenticated]);

  // Don't render anything during loading or redirect states
  if (!shouldRender && !isLoading) {
    return fallback;
  }

  // Render children with optional wrapper
  if (className) {
    return <div className={className}>{children}</div>;
  }

  return <>{children}</>;
}

/**
 * Convenience component for protecting authenticated routes
 * Automatically redirects to login if user is not authenticated
 */
export function ProtectedRoute({
  children,
  redirectTo = '/login',
  fallback,
  className,
}: {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
  className?: string;
}) {
  return (
    <AuthGate requireAuth={true} redirectTo={redirectTo} fallback={fallback} className={className}>
      {children}
    </AuthGate>
  );
}

/**
 * Convenience component for guest-only routes (login, register, etc.)
 * Automatically redirects to home if user is already authenticated
 */
export function GuestOnlyRoute({
  children,
  redirectTo = '/',
  fallback,
  className,
}: {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
  className?: string;
}) {
  return (
    <AuthGate requireGuest={true} redirectTo={redirectTo} fallback={fallback} className={className}>
      {children}
    </AuthGate>
  );
}

/**
 * Role-based access control component
 * Restricts access based on user roles
 */
export function RoleGate({
  children,
  allowedRoles,
  fallback = <div>Access denied. You don't have permission to view this content.</div>,
  redirectTo,
}: {
  children: React.ReactNode;
  allowedRoles: Array<'USER' | 'SELLER' | 'ADMIN'>;
  fallback?: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useServerAuth();

  // Check if user has required role
  const hasRequiredRole = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    return allowedRoles.includes(user.role);
  }, [isAuthenticated, user, allowedRoles]);

  // Handle redirect for unauthorized access
  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRequiredRole && redirectTo) {
      router.replace(redirectTo);
    }
  }, [isLoading, isAuthenticated, hasRequiredRole, redirectTo, router]);

  // Don't render during loading
  if (isLoading) return null;

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthGate requireAuth={true} redirectTo="/login">
        {children}
      </AuthGate>
    );
  }

  // Show fallback if user doesn't have required role
  if (!hasRequiredRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Admin-only access component
 * Convenience wrapper for admin-restricted content
 */
export function AdminOnly({
  children,
  fallback,
  redirectTo,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}) {
  return (
    <RoleGate allowedRoles={['ADMIN']} fallback={fallback} redirectTo={redirectTo}>
      {children}
    </RoleGate>
  );
}

/**
 * Seller and Admin access component
 * For content that requires seller privileges or higher
 */
export function SellerOnly({
  children,
  fallback,
  redirectTo,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}) {
  return (
    <RoleGate allowedRoles={['SELLER', 'ADMIN']} fallback={fallback} redirectTo={redirectTo}>
      {children}
    </RoleGate>
  );
}
