'use client';

import { useIsAuthenticated } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function RouteGuard({ children, requireAuth = false, redirectTo = '/' }: RouteGuardProps) {
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      router.push('/login');
    } else if (!requireAuth && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, requireAuth, redirectTo, router]);

  // For guest-only routes, don't show loading if user is authenticated (will redirect)
  if (!requireAuth && isAuthenticated) {
    return null; // Will redirect, no need to show loading
  }

  // For auth-required routes, show loading if not authenticated (will redirect)
  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect, no need to show loading
  }

  return <>{children}</>;
}

interface GuestOnlyProps {
  children: ReactNode;
  redirectTo?: string;
}

export function GuestOnly({ children, redirectTo = '/' }: GuestOnlyProps) {
  return (
    <RouteGuard requireAuth={false} redirectTo={redirectTo}>
      {children}
    </RouteGuard>
  );
}

interface AuthRequiredProps {
  children: ReactNode;
}

export function AuthRequired({ children }: AuthRequiredProps) {
  return <RouteGuard requireAuth={true}>{children}</RouteGuard>;
}
