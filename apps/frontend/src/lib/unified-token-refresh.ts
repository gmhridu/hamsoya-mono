/**
 * Unified Token Refresh System
 * Eliminates conflicts between multiple token refresh implementations
 * Provides seamless automatic token refresh without user intervention
 */

import { useAuthStore } from '@/store/auth-store';
import { toastService } from './toast-service';

interface TokenPayload {
  userId: string;
  email: string;
  name?: string;
  role: string;
  profile_image_url?: string;
  is_verified: boolean;
  exp: number;
  iat: number;
}

class UnifiedTokenRefreshService {
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;
  private isStarted = false;

  /**
   * Start the token refresh service
   */
  start(): void {
    if (typeof window === 'undefined' || this.isStarted) return;

    this.isStarted = true;

    // Check if we need immediate refresh (no access token but have refresh token)
    const accessToken = this.getAccessTokenFromCookie();
    const refreshToken = this.getRefreshTokenFromCookie();

    if (!accessToken && refreshToken) {
      // Immediately refresh to restore authentication state
      this.performRefresh().then(success => {
        if (success && this.isStarted) {
          this.scheduleNextRefresh();
        }
      });
    } else {
      this.scheduleNextRefresh();
    }
  }

  /**
   * Stop the token refresh service
   */
  stop(): void {
    this.isStarted = false;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Manually refresh tokens now
   */
  async refreshNow(): Promise<boolean> {
    return this.performRefresh();
  }

  /**
   * Schedule the next token refresh
   */
  private scheduleNextRefresh(): void {
    if (!this.isStarted) return;

    // Clear any existing timer without stopping the service
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    const accessToken = this.getAccessTokenFromCookie();
    if (!accessToken) {
      return;
    }

    const payload = this.parseTokenPayload(accessToken);
    if (!payload) {
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = payload.exp - now;

    // If token is already expired or expires in less than 30 seconds, refresh immediately
    if (expiresIn <= 30) {
      this.performRefresh().then(success => {
        if (success && this.isStarted) {
          // Schedule next refresh if successful
          this.scheduleNextRefresh();
        }
      });
      return;
    }

    // Refresh 1 minute before expiry (or 30 seconds if token expires in less than 90 seconds)
    const refreshIn = Math.max(30, expiresIn - 60);

    this.refreshTimer = setTimeout(() => {
      this.performRefresh().then(success => {
        if (success && this.isStarted) {
          // Schedule next refresh if successful
          this.scheduleNextRefresh();
        }
      });
    }, refreshIn * 1000);
  }

  /**
   * Perform the actual token refresh
   */
  private async performRefresh(): Promise<boolean> {
    if (this.isRefreshing) {
      return this.refreshPromise || Promise.resolve(false);
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefresh();

    try {
      const success = await this.refreshPromise;
      return success;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Execute the refresh request
   */
  private async doRefresh(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Update auth store with new user data
        if (data.data?.user || data.user) {
          const user = data.data?.user || data.user;
          const { setUser } = useAuthStore.getState();
          setUser(user);
        }

        // Don't show toast for successful refresh to avoid UI interruptions
        // toastService.auth.tokenRefreshSuccess();

        return true;
      } else {
        // Refresh failed, handle logout
        this.handleRefreshFailure();
        return false;
      }
    } catch (error) {
      this.handleRefreshFailure();
      return false;
    }
  }

  /**
   * Handle refresh failure by logging out user
   */
  private handleRefreshFailure(): void {
    this.stop();

    // Show error notification
    toastService.auth.tokenRefreshError();

    // Clear auth store
    const { logout } = useAuthStore.getState();
    logout();

    // Redirect to login page after a short delay to show the toast
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  }

  /**
   * Get access token from cookie
   */
  private getAccessTokenFromCookie(): string | null {
    if (typeof window === 'undefined') return null;

    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    return cookies.accessToken || null;
  }

  /**
   * Get refresh token from cookie
   */
  private getRefreshTokenFromCookie(): string | null {
    if (typeof window === 'undefined') return null;

    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    return cookies.refreshToken || null;
  }

  /**
   * Parse JWT token payload
   */
  private parseTokenPayload(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Add padding if needed for base64 decoding
      let payload = parts[1];
      while (payload.length % 4) {
        payload += '=';
      }

      const decoded = JSON.parse(atob(payload));

      // Validate required fields
      if (!decoded.exp || !decoded.userId || !decoded.email) {
        return null;
      }

      return decoded as TokenPayload;
    } catch (error) {
      return null;
    }
  }
}

// Create singleton instance
export const unifiedTokenRefreshService = new UnifiedTokenRefreshService();

/**
 * React hook for token refresh
 */
export function useUnifiedTokenRefresh() {
  const start = () => unifiedTokenRefreshService.start();
  const stop = () => unifiedTokenRefreshService.stop();
  const refreshNow = () => unifiedTokenRefreshService.refreshNow();

  return {
    start,
    stop,
    refreshNow,
  };
}

/**
 * Initialize token refresh service
 * Call this once when the app starts
 */
export function initializeTokenRefresh(): void {
  if (typeof window !== 'undefined') {
    // Start the service when the page loads
    unifiedTokenRefreshService.start();

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Page became visible, restart the service
        unifiedTokenRefreshService.start();
      }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      unifiedTokenRefreshService.stop();
    });
  }
}
