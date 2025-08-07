/**
 * Route Optimizer Component
 * Provides instant route pre-compilation for ChatGPT-style performance
 * Eliminates compilation delays for critical routes
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { optimizeAppPerformance, precompileRoleBasedRoutes } from '@/lib/route-precompilation';

interface RouteOptimizerProps {
  /**
   * Whether to enable route pre-compilation
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Delay before starting optimization (in milliseconds)
   * @default 1000
   */
  delay?: number;
}

/**
 * Route Optimizer Component
 * Automatically pre-compiles routes based on user authentication state
 */
export function RouteOptimizer({ enabled = true, delay = 1000 }: RouteOptimizerProps) {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const optimizeRoutes = async () => {
      try {
        if (isAuthenticated && user?.role) {
          console.log(`[ROUTE-OPTIMIZER] Optimizing routes for ${user.role} user`);
          await precompileRoleBasedRoutes(user.role);
        } else {
          console.log('[ROUTE-OPTIMIZER] Optimizing public routes');
          await optimizeAppPerformance();
        }
      } catch (error) {
        console.error('[ROUTE-OPTIMIZER] Route optimization failed:', error);
      }
    };

    // Delay optimization to avoid blocking initial render
    const timeoutId = setTimeout(optimizeRoutes, delay);

    return () => clearTimeout(timeoutId);
  }, [enabled, delay, isAuthenticated, user?.role]);

  // This component doesn't render anything
  return null;
}

/**
 * Admin Route Optimizer
 * Specifically optimizes admin routes when admin user is detected
 */
export function AdminRouteOptimizer() {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') return;

    const optimizeAdminRoutes = async () => {
      try {
        console.log('[ADMIN-ROUTE-OPTIMIZER] Pre-compiling admin routes...');
        
        const { precompileAdminRoutes } = await import('@/lib/route-precompilation');
        await precompileAdminRoutes();
        
        console.log('[ADMIN-ROUTE-OPTIMIZER] Admin routes optimized');
      } catch (error) {
        console.error('[ADMIN-ROUTE-OPTIMIZER] Admin route optimization failed:', error);
      }
    };

    // Immediate optimization for admin routes
    optimizeAdminRoutes();
  }, [isAuthenticated, user?.role]);

  return null;
}

/**
 * Performance Monitor
 * Monitors and logs performance metrics for route navigation
 */
export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Monitor navigation performance
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log('[PERFORMANCE-MONITOR] Navigation timing:', {
            domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
            totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
          });
        }
      }
    });

    observer.observe({ entryTypes: ['navigation'] });

    return () => observer.disconnect();
  }, []);

  return null;
}

/**
 * Comprehensive Performance Optimizer
 * Combines route optimization with performance monitoring
 */
export function PerformanceOptimizer({ enabled = true }: { enabled?: boolean }) {
  return (
    <>
      <RouteOptimizer enabled={enabled} />
      <AdminRouteOptimizer />
      <PerformanceMonitor />
    </>
  );
}

/**
 * Hook for manual route optimization
 * Can be used in components that need to trigger route pre-compilation
 */
export function useRouteOptimization() {
  const { user, isAuthenticated } = useAuthStore();

  const optimizeCurrentUserRoutes = async () => {
    if (!isAuthenticated || !user?.role) return;

    try {
      await precompileRoleBasedRoutes(user.role);
      console.log(`[ROUTE-OPTIMIZATION] Routes optimized for ${user.role}`);
    } catch (error) {
      console.error('[ROUTE-OPTIMIZATION] Manual optimization failed:', error);
    }
  };

  const optimizeAllRoutes = async () => {
    try {
      await optimizeAppPerformance(user?.role);
      console.log('[ROUTE-OPTIMIZATION] All routes optimized');
    } catch (error) {
      console.error('[ROUTE-OPTIMIZATION] Full optimization failed:', error);
    }
  };

  return {
    optimizeCurrentUserRoutes,
    optimizeAllRoutes,
  };
}
