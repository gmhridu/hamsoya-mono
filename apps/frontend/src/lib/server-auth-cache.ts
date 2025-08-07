/**
 * Server-Side Authentication Cache
 * Provides instant user data availability without API calls
 * Eliminates loading states by caching authentication state server-side
 */

import { cookies } from 'next/headers';
import { cache } from 'react';

interface CachedUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  isEmailVerified: boolean;
  is_verified: boolean; // Alias for compatibility
  createdAt: string;
  created_at: string; // Alias for compatibility
  updatedAt: string;
}

interface AuthCache {
  user: CachedUser | null;
  isAuthenticated: boolean;
  timestamp: number;
}

// In-memory cache for the current request
const requestCache = new Map<string, AuthCache>();

/**
 * Get cache key from cookies
 */
async function getCacheKey(): Promise<string> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  // Create a unique cache key based on tokens
  return `auth_${accessToken || 'anonymous'}_${refreshToken || 'none'}`;
}

/**
 * Check if user is authenticated based on cookies
 */
async function isAuthenticatedFromCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  return !!(accessToken && refreshToken);
}

/**
 * Fetch user data directly from backend API (only when not cached)
 */
async function fetchUserFromAPI(): Promise<CachedUser | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return null;
    }

    // Call backend API directly to avoid timeout issues
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    const response = await fetch(`${backendUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const user = data.data; // Backend returns data in successResponse format

    if (!user) return null;

    // Map API response to CachedUser format with compatibility aliases
    return {
      ...user,
      is_verified: user.isEmailVerified || user.is_verified || false,
      created_at: user.createdAt || user.created_at || new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Failed to fetch user from backend API:', error);
    return null;
  }
}

/**
 * Get cached authentication state or fetch if not available
 * Uses React cache() for request-level memoization
 */
export const getCachedAuth = cache(async (): Promise<AuthCache> => {
  const cacheKey = await getCacheKey();

  // Check request-level cache first with longer cache time
  const cached = requestCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 300000) {
    // 5 minute cache - longer to reduce API calls during page navigation
    return cached;
  }

  // Determine authentication status from cookies
  const isAuthenticated = await isAuthenticatedFromCookies();

  let user: CachedUser | null = null;

  if (isAuthenticated) {
    // Only fetch user data if authenticated
    user = await fetchUserFromAPI();

    // If API call fails but cookies exist, user might still be authenticated
    // but we'll treat as not authenticated for safety
    if (!user) {
      // Clear invalid cookies by returning unauthenticated state
      const authCache: AuthCache = {
        user: null,
        isAuthenticated: false,
        timestamp: Date.now(),
      };

      requestCache.set(cacheKey, authCache);
      return authCache;
    }
  }

  const authCache: AuthCache = {
    user,
    isAuthenticated: !!user,
    timestamp: Date.now(),
  };

  // Cache the result for this request
  requestCache.set(cacheKey, authCache);

  return authCache;
});

/**
 * Get current user with instant availability
 * This is the main function used by pages and components
 */
export async function getCurrentUserInstant(): Promise<{
  user: CachedUser | null;
  isAuthenticated: boolean;
}> {
  const authCache = await getCachedAuth();

  return {
    user: authCache.user,
    isAuthenticated: authCache.isAuthenticated,
  };
}

/**
 * Check if user has specific role
 */
export async function hasRole(allowedRoles: Array<'USER' | 'SELLER' | 'ADMIN'>): Promise<boolean> {
  const { user, isAuthenticated } = await getCurrentUserInstant();

  if (!isAuthenticated || !user) {
    return false;
  }

  return allowedRoles.includes(user.role);
}

/**
 * Clear authentication cache (for logout)
 */
export function clearAuthCache(): void {
  requestCache.clear();
}

/**
 * Validate authentication state for middleware
 */
export async function validateAuthFromCookies(): Promise<{
  isAuthenticated: boolean;
  hasValidTokens: boolean;
}> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  const hasValidTokens = !!(accessToken && refreshToken);

  return {
    isAuthenticated: hasValidTokens,
    hasValidTokens,
  };
}
