/**
 * Login utility functions for optimized authentication flow
 */

import type { User } from '@/types/auth';
import { AUTH_CONFIG, AUTH_QUERY_KEYS } from '@/types/auth';
import { queryClient } from './query-client';

/**
 * Get redirect URL from current page or default
 */
export function getLoginRedirectUrl(defaultUrl: string = '/'): string {
  if (typeof window === 'undefined') return defaultUrl;

  const urlParams = new URLSearchParams(window.location.search);
  const redirectTo = urlParams.get('redirect');

  if (!redirectTo) return defaultUrl;

  // Validate redirect URL to prevent open redirects
  try {
    const url = new URL(redirectTo, window.location.origin);
    if (url.origin === window.location.origin) {
      return redirectTo;
    }
  } catch {
    // Invalid URL, use default
  }

  return defaultUrl;
}

/**
 * Optimized user data hydration for instant UI updates
 */
export function hydrateUserData(user: User): void {
  authCacheManager.prefetchUserData(user);
}

/**
 * Clear all auth-related cache data
 */
export function clearAuthCache(): void {
  authCacheManager.clearUserCache();
}

/**
 * Preload critical user data after login
 */
export async function preloadUserData(user: User): Promise<void> {
  const promises = [];

  // Preload user profile if not already cached
  if (!queryClient.getQueryData(AUTH_QUERY_KEYS.profile)) {
    promises.push(
      queryClient.prefetchQuery({
        queryKey: AUTH_QUERY_KEYS.profile,
        queryFn: () => Promise.resolve(user), // Use current user data
        staleTime: AUTH_CONFIG.staleTime,
      })
    );
  }

  // Preload bookmarks count
  promises.push(
    queryClient.prefetchQuery({
      queryKey: ['bookmarks', 'count'],
      queryFn: () => Promise.resolve(0), // Placeholder
      staleTime: 2 * 60 * 1000,
    })
  );

  // Wait for critical data to load
  await Promise.allSettled(promises);
}

/**
 * Check if user has valid session based on cookies
 */
export function hasValidSession(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for access token cookie
  const hasAccessToken = document.cookie.includes('accessToken=');

  // Additional validation could be added here
  return hasAccessToken;
}

/**
 * Get stored redirect URL and clear it
 */
export function getAndClearStoredRedirect(): string | null {
  if (typeof window === 'undefined') return null;

  const stored = sessionStorage.getItem('auth_redirect');
  if (stored) {
    sessionStorage.removeItem('auth_redirect');
    return stored;
  }

  return null;
}

/**
 * Store redirect URL for after login
 */
export function storeRedirectUrl(url: string): void {
  if (typeof window === 'undefined') return;

  sessionStorage.setItem('auth_redirect', url);
}

/**
 * Optimized login success handler
 */
export async function handleLoginSuccess(user: User, redirectUrl?: string): Promise<void> {
  // Hydrate user data immediately
  hydrateUserData(user);

  // Preload critical data in background
  preloadUserData(user).catch(console.error);

  // Get final redirect URL
  const finalRedirectUrl = redirectUrl || getAndClearStoredRedirect() || getLoginRedirectUrl('/');

  // Use window.location.replace for instant redirect without history entry
  // This provides smooth, instant navigation like ChatGPT
  if (typeof window !== 'undefined') {
    window.location.replace(finalRedirectUrl);
  }
}

/**
 * Optimized logout handler
 */
export async function handleLogout(): Promise<void> {
  // Clear all auth-related cache
  clearAuthCache();

  // Clear any stored redirect URLs
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('auth_redirect');

    // Always use Next.js router for smooth navigation - no browser fallbacks
    const { default: Router } = await import('next/router');
    Router.push('/');
  }
}

/**
 * Check if current page is a protected route
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ['/dashboard', '/profile', '/settings', '/orders', '/bookmarks'];

  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Check if current page is a guest-only route
 */
export function isGuestOnlyRoute(pathname: string): boolean {
  const guestOnlyRoutes = ['/login', '/register', '/forgot-password', '/verify-email'];

  return guestOnlyRoutes.some(route => pathname.startsWith(route));
}
