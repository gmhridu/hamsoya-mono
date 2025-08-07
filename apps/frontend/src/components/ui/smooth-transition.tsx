/**
 * Smooth Transition Component
 * Works with native View Transitions for seamless navigation
 * Provides fallback for data loading states within pages
 */

'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface SmoothTransitionProps {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
  showFallback?: boolean;
}

/**
 * Smooth transition wrapper for content within pages
 * Navigation transitions are handled by native View Transitions
 */
export function SmoothTransition({
  children,
  className,
  fallback,
  showFallback = false,
}: SmoothTransitionProps) {
  // For data loading within pages, show fallback if needed
  if (showFallback && fallback) {
    return <div className={cn('transition-opacity duration-300', className)}>{fallback}</div>;
  }

  // For normal content, render immediately
  // Navigation smoothness is handled by View Transitions
  return <div className={cn('opacity-100', className)}>{children}</div>;
}

/**
 * Loading skeleton for smooth transitions
 */
export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
    </div>
  );
}

/**
 * Page transition wrapper for smooth navigation
 */
export function PageTransition({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  // Simple page transition wrapper
  return (
    <div className={cn('relative', className)}>
      <SmoothTransition>{children}</SmoothTransition>
    </div>
  );
}

/**
 * Auth-aware transition component
 */
interface AuthTransitionProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  fallback?: ReactNode;
}

export function AuthTransition({
  children,
  isAuthenticated: _isAuthenticated, // Prefix with underscore to indicate intentionally unused
  isLoading = false,
  fallback,
}: AuthTransitionProps) {
  if (isLoading) {
    return (
      <SmoothTransition showFallback fallback={fallback || <LoadingSkeleton />}>
        {children}
      </SmoothTransition>
    );
  }

  return <SmoothTransition>{children}</SmoothTransition>;
}

/**
 * Hook for smooth navigation with View Transitions
 * @deprecated Use useViewTransitionRouter from view-transition-link.tsx instead
 */
export function useSmoothNavigation() {
  const navigate = async (href: string) => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      const { useRouter } = await import('next/navigation');
      const router = useRouter();
      (document as any).startViewTransition(() => {
        router.push(href);
      });
    } else {
      const { useRouter } = await import('next/navigation');
      const router = useRouter();
      router.push(href);
    }
  };

  return {
    navigate,
    isNavigating: false, // No loading states with View Transitions
  };
}
