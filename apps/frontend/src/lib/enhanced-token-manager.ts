/**
 * Enhanced Token Management System
 * Provides comprehensive token cleanup and management with automatic refresh token removal
 * when access tokens become invalid, handles server restart scenarios, and cleans up on code errors
 */

'use client';

import { deleteCookie, getAccessToken, getRefreshToken } from './cookies';
import { useAuthStore } from '@/store/auth-store';
import { toastService } from './toast-service';

interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  expiresAt: number | null;
  shouldCleanup: boolean;
}

class EnhancedTokenManager {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private lastAccessTokenCheck: string | null = null;

  /**
   * Initialize the token manager with comprehensive monitoring
   */
  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    this.isInitialized = true;

    // Immediate cleanup check
    this.performComprehensiveCleanup();

    // Set up periodic monitoring every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.performComprehensiveCleanup();
    }, 30 * 1000);

    // Monitor on various events for immediate cleanup
    this.setupEventListeners();

    // Monitor for server restart scenarios
    this.setupServerRestartDetection();
  }

  /**
   * Perform comprehensive token cleanup with server restart detection
   */
  private performComprehensiveCleanup(): void {
    try {
      // Check for server restart scenario first
      this.detectServerRestart();

      const accessToken = getAccessToken();

      // Since access tokens are now httpOnly, we can't read them client-side
      // Instead, we'll check authentication status via API call
      this.validateAuthenticationStatus();

    } catch (error) {
      console.error('Error during token cleanup:', error);
      // On any error, perform safe cleanup
      this.cleanupAllTokens('Error during token validation');
    }
  }

  /**
   * Detect server restart by checking authentication status
   */
  private async detectServerRestart(): Promise<void> {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.status === 401) {
        // Unauthorized - tokens are invalid or expired
        this.cleanupAllTokens('Authentication check failed - tokens invalid');
        this.redirectToLogin();
      } else if (!response.ok) {
        // Other errors might indicate server issues
        console.warn('Authentication check failed with status:', response.status);
      }
    } catch (error) {
      // Network error or server down - don't cleanup tokens yet
      console.warn('Authentication check network error:', error);
    }
  }

  /**
   * Validate authentication status via API
   */
  private async validateAuthenticationStatus(): Promise<void> {
    const { isAuthenticated } = useAuthStore.getState();

    if (isAuthenticated) {
      // User should be authenticated, verify with server
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.status === 401) {
          // User thinks they're authenticated but server says no
          this.cleanupAllTokens('Authentication mismatch detected');
          this.redirectToLogin();
        }
      } catch (error) {
        // Network error - don't cleanup yet
        console.warn('Auth validation network error:', error);
      }
    }
  }

  /**
   * Redirect to login page
   */
  private redirectToLogin(): void {
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  }

  /**
   * Validate access token structure and expiration
   */
  private validateAccessToken(token: string | null): TokenValidationResult {
    if (!token) {
      return {
        isValid: false,
        isExpired: true,
        expiresAt: null,
        shouldCleanup: true,
      };
    }

    try {
      // Parse JWT payload
      const parts = token.split('.');
      if (parts.length !== 3) {
        return {
          isValid: false,
          isExpired: true,
          expiresAt: null,
          shouldCleanup: true,
        };
      }

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = payload.exp;

      if (!expiresAt) {
        return {
          isValid: false,
          isExpired: true,
          expiresAt: null,
          shouldCleanup: true,
        };
      }

      const isExpired = expiresAt <= now;
      const isExpiringSoon = expiresAt <= now + 60; // Expires within 1 minute

      return {
        isValid: !isExpired,
        isExpired,
        expiresAt: expiresAt * 1000,
        shouldCleanup: isExpired || isExpiringSoon,
      };
    } catch (error) {
      return {
        isValid: false,
        isExpired: true,
        expiresAt: null,
        shouldCleanup: true,
      };
    }
  }

  /**
   * Clean up all authentication tokens and state
   */
  private cleanupAllTokens(reason: string): void {
    console.log(`Token cleanup triggered: ${reason}`);

    // Remove cookies
    deleteCookie('accessToken');
    deleteCookie('refreshToken');

    // Clear from any potential storage locations
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Clear any auth-related localStorage items
      Object.keys(localStorage).forEach(key => {
        if (key.includes('auth') || key.includes('token') || key.includes('user')) {
          localStorage.removeItem(key);
        }
      });
    }

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('auth_redirect');
    }

    // Clear auth store
    const { logout } = useAuthStore.getState();
    logout();

    // Show user-friendly notification (only if not already logged out)
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      toastService.auth.sessionExpired();
    }
  }

  /**
   * Set up event listeners for immediate cleanup
   */
  private setupEventListeners(): void {
    const events = ['focus', 'visibilitychange', 'beforeunload'];

    events.forEach(event => {
      window.addEventListener(event, () => {
        this.performComprehensiveCleanup();
      }, { passive: true });
    });

    // Listen for storage events (cross-tab synchronization)
    window.addEventListener('storage', (event) => {
      if (event.key === 'accessToken' || event.key === 'refreshToken') {
        // Token changed in another tab, revalidate
        setTimeout(() => this.performComprehensiveCleanup(), 100);
      }
    });
  }

  /**
   * Detect server restart scenarios
   */
  private setupServerRestartDetection(): void {
    // Monitor for fetch errors that might indicate server restart
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        // If we get 401 on any authenticated request, check tokens
        if (response.status === 401) {
          setTimeout(() => this.performComprehensiveCleanup(), 100);
        }

        return response;
      } catch (error) {
        // Network errors might indicate server restart
        if (error instanceof TypeError && error.message.includes('fetch')) {
          setTimeout(() => this.performComprehensiveCleanup(), 1000);
        }
        throw error;
      }
    };
  }

  /**
   * Force immediate cleanup (for use in error handlers)
   */
  forceCleanup(reason: string = 'Manual cleanup'): void {
    this.cleanupAllTokens(reason);
  }

  /**
   * Check if tokens are in a valid state
   */
  areTokensValid(): boolean {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (!accessToken || !refreshToken) {
      return false;
    }

    const validation = this.validateAccessToken(accessToken);
    return validation.isValid;
  }

  /**
   * Get token expiration info
   */
  getTokenInfo(): { expiresAt: number | null; isValid: boolean; timeUntilExpiry: number | null } {
    const accessToken = getAccessToken();
    const validation = this.validateAccessToken(accessToken);

    return {
      expiresAt: validation.expiresAt,
      isValid: validation.isValid,
      timeUntilExpiry: validation.expiresAt ? validation.expiresAt - Date.now() : null,
    };
  }

  /**
   * Cleanup and destroy the token manager
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isInitialized = false;
  }
}

// Create singleton instance
export const enhancedTokenManager = new EnhancedTokenManager();

// Auto-initialize on import (client-side only)
if (typeof window !== 'undefined') {
  enhancedTokenManager.initialize();
}

// Export for manual control
export { EnhancedTokenManager };
