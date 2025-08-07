'use client';

import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminRouteGuard } from '@/components/guards/admin-route-guard';
import { adminDataPrefetcher } from '@/lib/admin-data-prefetcher';
import type { User } from '@/types/auth';
import { ReactNode, useEffect, useState, Suspense } from 'react';
import { ErrorBoundary } from '../ui/error-boundary';

interface AdminLayoutClientProps {
  children: ReactNode;
  initialUser: User | null;
}

/**
 * Enhanced loading component for admin layout
 */
function AdminLoadingState() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar skeleton */}
        <div className="hidden lg:flex w-64 bg-card border-r border-border">
          <div className="flex flex-col w-full">
            {/* Logo skeleton */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-lg animate-pulse"></div>
                <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
              </div>
            </div>

            {/* Navigation skeleton */}
            <div className="flex-1 p-4 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Header skeleton */}
          <div className="h-16 bg-card border-b border-border flex items-center justify-between px-4">
            <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Content skeleton */}
          <div className="flex-1 bg-muted/30 p-6">
            <div className="mx-auto max-w-7xl w-full space-y-6">
              <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 bg-card rounded-lg animate-pulse"></div>
                ))}
              </div>
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="h-80 bg-card rounded-lg animate-pulse"></div>
                <div className="h-80 bg-card rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Error fallback component for admin layout
 */
function AdminErrorFallback({ error, resetError, goHome }: { error?: Error; resetError: () => void; goHome: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-foreground">Admin Dashboard Error</h2>
        <p className="text-muted-foreground">
          There was an error loading the admin dashboard. This might be a temporary issue.
        </p>
        <div className="space-y-2">
          <button
            onClick={resetError}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={goHome}
            className="w-full px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">Error Details</summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * Simplified admin layout component
 * Server-side authentication is the single source of truth
 * If this component renders, the user is already authenticated and authorized as ADMIN
 */
export function AdminLayoutClient({ children, initialUser }: AdminLayoutClientProps) {
  const [prefetchCompleted, setPrefetchCompleted] = useState(false);

  // Server-side authentication ensures initialUser is a valid ADMIN user
  const user = initialUser!; // Non-null assertion safe due to server-side validation

  // Initialize admin data prefetching
  useEffect(() => {
    if (!prefetchCompleted) {
      console.log('AdminLayoutClient - Starting admin data prefetch...');

      adminDataPrefetcher.prefetchAllAdminData()
        .then(() => {
          console.log('AdminLayoutClient - Admin data prefetch completed');
          setPrefetchCompleted(true);
        })
        .catch((error) => {
          console.error('AdminLayoutClient - Admin data prefetch failed:', error);
          // Still mark as completed to avoid infinite retries
          setPrefetchCompleted(true);
        });
    }
  }, [prefetchCompleted]);

  console.log('✅ AdminLayoutClient rendering for admin user:', {
    id: user.id,
    role: user.role,
    prefetchCompleted
  });

  // Render admin layout with error boundary
  return (
    <ErrorBoundary
      fallback={AdminErrorFallback}
      onError={(error) => {
        console.error('AdminLayoutClient - Error boundary caught:', error);
        // Clear admin cache on error
        adminDataPrefetcher.clearAdminCache();
      }}
    >
      <AdminRouteGuard>
        <div className="min-h-screen bg-background">
          {/* Mobile-first responsive layout */}
          <div className="flex h-screen">
            {/* Sidebar - Hidden on mobile, visible on desktop */}
            <Suspense fallback={<div className="hidden lg:block w-64 bg-card border-r border-border animate-pulse" />}>
              <AdminSidebar user={user} />
            </Suspense>

            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header */}
              <Suspense fallback={<div className="h-16 bg-card border-b border-border animate-pulse" />}>
                <AdminHeader user={user} />
              </Suspense>

              {/* Page content with responsive padding */}
              <main className="flex-1 overflow-y-auto bg-muted/30 p-3 sm:p-4 md:p-6">
                <div className="mx-auto max-w-7xl w-full">
                  <Suspense fallback={<AdminLoadingState />}>
                    {children}
                  </Suspense>
                </div>
              </main>
            </div>
          </div>
        </div>
      </AdminRouteGuard>
    </ErrorBoundary>
  );
}
