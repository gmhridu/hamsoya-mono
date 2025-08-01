/**
 * Smooth Transition Component
 * Eliminates white screen flashes during navigation and loading states
 * ZERO FLICKER: Removed useEffect hooks to prevent re-renders
 */

'use client';

import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';

interface SmoothTransitionProps {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
  showFallback?: boolean;
}

/**
 * Smooth transition wrapper that prevents white screen flashes
 * ZERO FLICKER: Removed useEffect and state to prevent re-renders
 */
export function SmoothTransition({
  children,
  className,
  fallback,
  showFallback = false,
}: SmoothTransitionProps) {
  // No state or useEffect - render immediately to prevent flicker
  // The CSS transition will handle any visual smoothness needed

  if (showFallback && fallback) {
    return <div className={cn('transition-opacity duration-300', className)}>{fallback}</div>;
  }

  // Always render with full opacity - no loading states or transitions
  // This eliminates white screen flicker completely
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
 * Hook for smooth navigation with loading states
 */
export function useSmoothNavigation() {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const navigate = async (href: string) => {
    setIsNavigating(true);
    try {
      router.push(href);
    } finally {
      // Reset loading state after a short delay to ensure smooth transition
      setTimeout(() => setIsNavigating(false), 300);
    }
  };

  return {
    navigate,
    isNavigating,
  };
}
