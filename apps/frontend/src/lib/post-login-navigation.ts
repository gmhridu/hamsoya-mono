'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Post-login navigation utility
 * Provides seamless client-side navigation after successful login
 * without using window.location or page reloads
 */
export function usePostLoginNavigation() {
  const router = useRouter();

  /**
   * Navigate to home page after successful login
   * Uses Next.js router for instant client-side navigation
   */
  const navigateToHome = useCallback(() => {
    // Use router.push for instant client-side navigation
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
    router.refresh();
  }, [router]);

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
 * Utility function for handling post-login redirects
 * Can be used in login components or auth callbacks
 */
export function handlePostLoginRedirect(
  router: ReturnType<typeof useRouter>,
  redirectPath?: string | null
) {
  // If there's a specific redirect path, use it
  if (redirectPath && redirectPath !== '/login') {
    router.push(redirectPath);
    return;
  }

  // Default to home page
  router.push('/');
}

/**
 * Hook for managing login flow with navigation
 * Combines authentication state with navigation logic
 */
export function useLoginFlow() {
  const router = useRouter();
  const { navigateToHomeAndReplace } = usePostLoginNavigation();

  /**
   * Complete login flow
   * Handles post-login navigation and cleanup
   */
  const completeLogin = useCallback((redirectPath?: string) => {
    if (redirectPath && redirectPath !== '/login') {
      router.replace(redirectPath);
    } else {
      navigateToHomeAndReplace();
    }
  }, [router, navigateToHomeAndReplace]);

  /**
   * Handle login success with optional redirect
   */
  const handleLoginSuccess = useCallback((redirectPath?: string) => {
    // Small delay to allow any auth state updates to complete
    setTimeout(() => {
      completeLogin(redirectPath);
    }, 50);
  }, [completeLogin]);

  return {
    completeLogin,
    handleLoginSuccess,
  };
}

/**
 * Navigation utilities for different scenarios
 */
export const navigationUtils = {
  /**
   * Navigate to home page (standard navigation)
   */
  goHome: (router: ReturnType<typeof useRouter>) => {
    router.push('/');
  },

  /**
   * Navigate to home page and replace history
   */
  goHomeReplace: (router: ReturnType<typeof useRouter>) => {
    router.replace('/');
  },

  /**
   * Navigate to products page
   */
  goToProducts: (router: ReturnType<typeof useRouter>) => {
    router.push('/products');
  },

  /**
   * Navigate to dashboard (for authenticated users)
   */
  goToDashboard: (router: ReturnType<typeof useRouter>) => {
    router.push('/dashboard');
  },

  /**
   * Navigate to bookmarks page
   */
  goToBookmarks: (router: ReturnType<typeof useRouter>) => {
    router.push('/bookmarks');
  },

  /**
   * Navigate to order page
   */
  goToOrder: (router: ReturnType<typeof useRouter>) => {
    router.push('/order');
  },
} as const;
