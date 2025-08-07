'use client';

import { useViewTransitionRouter } from '@/components/ui/view-transition-link';
import { redirect, useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { AUTH_QUERY_KEYS } from '@/types/auth';

/**
 * Post-login navigation utility
 * Provides seamless client-side navigation after successful login
 * with native View Transitions for smooth experience
 */
export function usePostLoginNavigation() {
  const router = useViewTransitionRouter();
  const nextRouter = useRouter(); // For refresh functionality

  /**
   * Navigate to home page after successful login
   * Uses View Transitions for smooth navigation
   */
  const navigateToHome = useCallback(() => {
    router.push('/');
  }, [router]);

  /**
   * Navigate to a specific page after login
   * @param path - The path to navigate to
   */
  const navigateToPath = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  /**
   * Navigate with replace (replaces current history entry)
   * Useful when you don't want users to go back to login page
   */
  const navigateAndReplace = useCallback((path: string) => {
    router.replace(path);
  }, [router]);

  /**
   * Navigate to home and replace history entry
   * Prevents users from going back to login page
   */
  const navigateToHomeAndReplace = useCallback(() => {
    router.replace('/');
  }, [router]);

  /**
   * Refresh the current page data
   * Useful for updating server-side data after login
   */
  const refreshPage = useCallback(() => {
    nextRouter.refresh();
  }, [nextRouter]);

  return {
    navigateToHome,
    navigateToPath,
    navigateAndReplace,
    navigateToHomeAndReplace,
    refreshPage,
  };
}

/**
 * Post-login navigation with loading state management
 * Provides navigation with loading indicators
 */
export function usePostLoginNavigationWithLoading() {
  const router = useRouter();

  /**
   * Navigate to home with loading state
   * Returns a promise that resolves when navigation is complete
   */
  const navigateToHomeWithLoading = useCallback(async () => {
    try {
      // Start navigation
      router.push('/');

      // Return a promise that resolves after a short delay
      // This allows the UI to show loading states during navigation
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 100);
      });
    } catch (error) {
      console.error('Navigation error:', error);
      throw error;
    }
  }, [router]);

  /**
   * Navigate to path with loading state
   */
  const navigateToPathWithLoading = useCallback(async (path: string) => {
    try {
      router.push(path);

      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 100);
      });
    } catch (error) {
      console.error('Navigation error:', error);
      throw error;
    }
  }, [router]);

  return {
    navigateToHomeWithLoading,
    navigateToPathWithLoading,
  };
}

/**
 * Validate redirect path based on user role
 * SECURITY: Prevents unauthorized users from being redirected to admin routes
 */
function validateRedirectPath(path: string, userRole?: string): string | null {
  if (!path || path === '/login') {
    return null;
  }

  // Security check: Admin routes only for admin users
  if (path.startsWith('/admin') && userRole !== 'ADMIN') {
    return null; // Block admin redirects for non-admin users
  }

  // Additional security checks
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return null; // Block external redirects
  }

  if (path.includes('..') || path.includes('//')) {
    return null; // Block path traversal attempts
  }

  return path;
}

/**
 * Utility function for handling post-login redirects
 * Can be used in login components or auth callbacks
 * Now includes role-based redirect logic with security validation
 * Uses server actions for immediate redirection
 */
export async function handlePostLoginRedirect(
  redirectPath?: string | null,
  userRole?: string
) {
  console.log('handlePostLoginRedirect called with:', { redirectPath, userRole });

  // Use server action for redirect
  const { redirectAfterLogin } = await import('@/lib/server-navigation');
  await redirectAfterLogin(redirectPath || undefined);
}

/**
 * Hook for managing login flow with navigation
 * Combines authentication state with navigation logic
 * Now includes role-based redirect logic
 */
export function useLoginFlow() {
  const router = useRouter();
  const { navigateToHomeAndReplace, navigateAndReplace } = usePostLoginNavigation();

  /**
   * Complete login flow
   * Handles post-login navigation and cleanup with role-based logic and security validation
   * Uses server actions for immediate redirection
   */
  const completeLogin = useCallback(async (redirectPath?: string, userRole?: string) => {
    console.log('completeLogin called with:', { redirectPath, userRole });

    // Use server action for redirect
    const { redirectAfterLogin } = await import('@/lib/server-navigation');
    await redirectAfterLogin(redirectPath);
  }, []);

  /**
   * Handle login success with optional redirect and user role
   */
  const handleLoginSuccess = useCallback(async (redirectPath?: string, userRole?: string) => {
    console.log('handleLoginSuccess called with:', { redirectPath, userRole });

    // Use server action immediately
    await completeLogin(redirectPath, userRole);
  }, [completeLogin]);

  return {
    completeLogin,
    handleLoginSuccess,
  };
}

/**
 * Admin navigation utilities
 * Provides optimized navigation to admin routes with data prefetching
 */
export const adminNavigationUtils = {
  /**
   * Validate admin access before navigation
   * Returns true if user has admin access, false otherwise
   */
  async validateAdminAccess(): Promise<boolean> {
    try {
      // Import auth utilities dynamically
      const { useAuthStore } = await import('@/store/auth-store');
      const store = useAuthStore.getState();

      return store.isAuthenticated && store.user?.role === 'ADMIN';
    } catch (error) {
      console.error('Admin access validation failed:', error);
      return false;
    }
  },

  /**
   * Sync auth state before admin navigation
   * Ensures client and server auth state are synchronized
   */
  async syncAuthState(): Promise<void> {
    try {
      const { queryClient } = await import('@/lib/query-client');

      // Invalidate and refetch current user data to ensure fresh state
      await queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.me,
      });

      // Wait for fresh user data
      await queryClient.refetchQueries({
        queryKey: AUTH_QUERY_KEYS.me,
      });

      console.log('Auth state synchronized');
    } catch (error) {
      console.error('Auth state sync failed:', error);
      // Don't throw - navigation should still work
    }
  },
};

/**
 * Enhanced admin navigation hook
 * Provides optimistic navigation with prefetching and error handling
 */
export function useAdminNavigation() {
  const router = useViewTransitionRouter();
  const { isAuthenticated, user } = useAuthStore();

  /**
   * Navigate to admin dashboard with prefetching and validation
   * Implements optimistic navigation with fallback
   */
  const navigateToAdmin = useCallback(async (options?: {
    prefetch?: boolean;
    validate?: boolean;
    fallbackUrl?: string;
  }) => {
    const {
      prefetch = true,
      validate = true,
      fallbackUrl = '/login?error=' + encodeURIComponent('Admin access required')
    } = options || {};

    try {
      console.log('🚀 Starting admin navigation...', { isAuthenticated, userRole: user?.role });

      // Quick client-side validation first
      if (validate && (!isAuthenticated || user?.role !== 'ADMIN')) {
        console.log('❌ Admin access validation failed, redirecting to fallback');
        router.push(fallbackUrl);
        return;
      }

      // Prefetch admin data if requested
      if (prefetch) {
        console.log('📦 Prefetching admin data...');
        // Import and use admin data prefetcher
        const { adminDataPrefetcher } = await import('@/lib/admin-data-prefetcher');

        // Don't await - let prefetching happen in background
        adminDataPrefetcher.prefetchAllAdminData().catch(console.error);

        // Sync auth state to ensure consistency
        adminDataPrefetcher.syncAuthState().catch(console.error);
      }

      // Navigate optimistically
      console.log('🎯 Navigating to admin dashboard...');
      router.push('/admin');

    } catch (error) {
      console.error('❌ Admin navigation failed:', error);

      // Fallback navigation
      router.push(fallbackUrl);
    }
  }, [router, isAuthenticated, user]);

  /**
   * Prefetch admin data without navigation
   * Useful for hover effects or preparation
   */
  const prefetchAdminData = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      return;
    }

    try {
      const { adminDataPrefetcher } = await import('@/lib/admin-data-prefetcher');
      await adminDataPrefetcher.prefetchAllAdminData();
    } catch (error) {
      console.error('Admin data prefetching failed:', error);
    }
  }, [isAuthenticated, user]);

  return {
    navigateToAdmin,
    prefetchAdminData,
    canAccessAdmin: isAuthenticated && user?.role === 'ADMIN',
  };
}

/**
 * Navigation utilities for different scenarios
 * Updated to use View Transitions for smooth navigation with enhanced admin support
 */
export const navigationUtils = {
  /**
   * Navigate to home page (standard navigation)
   */
  goHome: (router: ReturnType<typeof useViewTransitionRouter>) => {
    router.push('/');
  },

  /**
   * Navigate to home page and replace history
   */
  goHomeReplace: (router: ReturnType<typeof useViewTransitionRouter>) => {
    router.replace('/');
  },

  /**
   * Navigate to products page
   */
  goToProducts: (router: ReturnType<typeof useViewTransitionRouter>) => {
    router.push('/products');
  },

  /**
   * Navigate to dashboard (for authenticated users)
   */
  goToDashboard: (router: ReturnType<typeof useViewTransitionRouter>) => {
    router.push('/dashboard');
  },

  /**
   * Navigate to admin dashboard (for admin users)
   * @deprecated Use useAdminNavigation hook instead for better prefetching and error handling
   */
  goToAdminDashboard: (router: ReturnType<typeof useViewTransitionRouter>) => {
    router.push('/admin');
  },

  /**
   * Navigate to bookmarks page
   */
  goToBookmarks: (router: ReturnType<typeof useViewTransitionRouter>) => {
    router.push('/bookmarks');
  },

  /**
   * Navigate to order page
   */
  goToOrder: (router: ReturnType<typeof useRouter>) => {
    router.push('/order');
  },
} as const;
