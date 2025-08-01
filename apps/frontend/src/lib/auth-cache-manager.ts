/**
 * Smart authentication cache management
 * Provides intelligent cache invalidation based on actual data changes
 */

import type { User } from '@/types/auth';
import { AUTH_CONFIG, AUTH_QUERY_KEYS } from '@/types/auth';
import { queryClient } from './query-client';

/**
 * Cache manager for authentication data
 * Handles smart invalidation and persistent caching
 */
class AuthCacheManager {
  private lastUserHash: string | null = null;
  private cacheVersion = 1;

  /**
   * Generate a hash of user data to detect changes
   */
  private generateUserHash(user: User | null): string {
    if (!user) return 'null';

    // Create hash based on key user properties that would affect UI
    const keyData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_image_url: user.profile_image_url,
      is_verified: user.is_verified,
    };

    return JSON.stringify(keyData);
  }

  /**
   * Check if user data has actually changed
   */
  private hasUserDataChanged(user: User | null): boolean {
    const currentHash = this.generateUserHash(user);
    const hasChanged = this.lastUserHash !== currentHash;

    if (hasChanged) {
      this.lastUserHash = currentHash;
      console.log('User data changed, cache will be invalidated');
    }

    return hasChanged;
  }

  /**
   * Set user data in cache with smart invalidation
   */
  setUserData(user: User | null): void {
    const hasChanged = this.hasUserDataChanged(user);

    // Always update the cache data
    queryClient.setQueryData(AUTH_QUERY_KEYS.me, user ? { data: user } : null);

    // Only invalidate related queries if data actually changed
    if (hasChanged) {
      this.invalidateRelatedQueries();
    }
  }

  /**
   * Invalidate user cache (force refresh)
   */
  invalidateUserCache(): void {
    console.log('Force invalidating user cache');
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
    this.invalidateRelatedQueries();
    this.lastUserHash = null; // Reset hash to force next comparison
  }

  /**
   * Clear all user-related cache data
   */
  clearUserCache(): void {
    console.log('Clearing all user cache');
    queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.me });
    queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.profile });
    this.clearRelatedQueries();
    this.lastUserHash = null;
  }

  /**
   * Invalidate queries related to user data
   */
  private invalidateRelatedQueries(): void {
    queryClient.invalidateQueries({
      queryKey: AUTH_QUERY_KEYS.profile,
      exact: false,
    });

    // Invalidate user-specific data
    queryClient.invalidateQueries({
      predicate: query => {
        return query.queryKey.some(
          key => typeof key === 'string' && (key.includes('user-') || key.includes('profile'))
        );
      },
    });
  }

  /**
   * Clear queries related to user data
   */
  private clearRelatedQueries(): void {
    queryClient.removeQueries({
      predicate: query => {
        return query.queryKey.some(
          key =>
            typeof key === 'string' &&
            (key.includes('user') || key.includes('auth') || key.includes('profile'))
        );
      },
    });
  }

  /**
   * Prefetch user data with persistent caching
   */
  prefetchUserData(user: User): void {
    // Set main user data
    this.setUserData(user);

    // Prefetch profile data
    queryClient.setQueryData(AUTH_QUERY_KEYS.profile, { data: user });

    // Prefetch commonly accessed user-related data
    const prefetchPromises = [
      queryClient.prefetchQuery({
        queryKey: ['user', 'bookmarks'],
        queryFn: () => Promise.resolve([]),
        staleTime: AUTH_CONFIG.staleTime,
        gcTime: AUTH_CONFIG.gcTime,
      }),
      queryClient.prefetchQuery({
        queryKey: ['user', 'orders', 'count'],
        queryFn: () => Promise.resolve(0),
        staleTime: AUTH_CONFIG.staleTime,
        gcTime: AUTH_CONFIG.gcTime,
      }),
    ];

    Promise.allSettled(prefetchPromises).catch(console.error);
  }

  /**
   * Get cached user data without triggering a fetch
   */
  getCachedUserData(): User | null {
    const cached = queryClient.getQueryData(AUTH_QUERY_KEYS.me);
    return cached?.data || null;
  }

  /**
   * Check if user data is cached and fresh
   */
  isUserDataCached(): boolean {
    const queryState = queryClient.getQueryState(AUTH_QUERY_KEYS.me);
    return !!queryState?.data && queryState.status === 'success';
  }

  /**
   * Handle token refresh - only invalidate if user data might have changed
   */
  handleTokenRefresh(): void {
    // Don't invalidate cache on token refresh - user data hasn't changed
    // Only log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Token refreshed - keeping user cache intact');
    }
  }

  /**
   * Handle logout - clear all user data
   */
  handleLogout(): void {
    this.clearUserCache();
  }

  /**
   * Handle login - set new user data
   */
  handleLogin(user: User): void {
    this.prefetchUserData(user);
  }
}

// Export singleton instance
export const authCacheManager = new AuthCacheManager();

// Export utility functions for backward compatibility
export const hydrateUserData = (user: User) => authCacheManager.prefetchUserData(user);
export const clearAuthCache = () => authCacheManager.clearUserCache();
export const invalidateUserCache = () => authCacheManager.invalidateUserCache();
