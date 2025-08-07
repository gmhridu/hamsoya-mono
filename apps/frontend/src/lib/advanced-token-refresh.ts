/**
 * Advanced Token Refresh Service
 * Provides enhanced token refresh with proper error handling, token rotation,
 * and automatic cleanup when refresh fails. Includes sequential logic to prevent code breakage.
 */

'use client';

import { enhancedTokenManager } from './enhanced-token-manager';
import { useAuthStore } from '@/store/auth-store';
import { toastService } from './toast-service';

interface RefreshResult {
  success: boolean;
  error?: string;
  shouldRetry?: boolean;
  shouldLogout?: boolean;
}

interface RefreshAttempt {
  timestamp: number;
  success: boolean;
  error?: string;
}

class AdvancedTokenRefreshService {
  private refreshPromise: Promise<RefreshResult> | null = null;
  private refreshAttempts: RefreshAttempt[] = [];
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second
  private isRefreshing = false;

  /**
   * Refresh tokens with advanced error handling and fallback
   */
  async refreshTokens(): Promise<RefreshResult> {
    // If already refreshing, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;

    return result;
  }

  /**
   * Perform the actual token refresh with retry logic
   */
  private async performRefresh(): Promise<RefreshResult> {
    this.isRefreshing = true;

    try {
      // Since tokens are now httpOnly, we can't check them client-side
      // We'll rely on the API call to determine if refresh is possible

      // Check if we've exceeded retry limits
      if (this.shouldStopRetrying()) {
        return this.handleRefreshFailure('Too many failed refresh attempts', true);
      }

      // Attempt to refresh
      const result = await this.attemptTokenRefresh();

      if (result.success) {
        this.recordSuccessfulRefresh();
        return result;
      } else {
        this.recordFailedRefresh(result.error || 'Unknown error');

        if (result.shouldRetry && !this.shouldStopRetrying()) {
          // Wait before retrying
          await this.delay(this.retryDelay);
          return this.performRefresh();
        } else {
          return this.handleRefreshFailure(result.error || 'Refresh failed', true);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.recordFailedRefresh(errorMessage);
      return this.handleRefreshFailure(errorMessage, true);
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Attempt to refresh tokens via API
   */
  private async attemptTokenRefresh(): Promise<RefreshResult> {
    try {
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Token refresh successful
        return { success: true };
      } else if (response.status === 401) {
        // Refresh token is invalid or expired
        return {
          success: false,
          error: 'Refresh token expired or invalid',
          shouldRetry: false,
          shouldLogout: true,
        };
      } else if (response.status >= 500) {
        // Server error, might be temporary
        return {
          success: false,
          error: 'Server error during token refresh',
          shouldRetry: true,
          shouldLogout: false,
        };
      } else {
        // Other client errors
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || 'Token refresh failed',
          shouldRetry: false,
          shouldLogout: true,
        };
      }
    } catch (error) {
      // Network or other errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error, might be temporary
        return {
          success: false,
          error: 'Network error during token refresh',
          shouldRetry: true,
          shouldLogout: false,
        };
      } else {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          shouldRetry: false,
          shouldLogout: true,
        };
      }
    }
  }

  /**
   * Handle refresh failure with comprehensive cleanup
   */
  private handleRefreshFailure(error: string, shouldLogout: boolean): RefreshResult {
    console.error('Token refresh failed:', error);

    if (shouldLogout) {
      // Use enhanced token manager for comprehensive cleanup
      enhancedTokenManager.forceCleanup(`Token refresh failed: ${error}`);

      // Show user-friendly notification
      toastService.auth.sessionExpired();

      // Redirect to login after a short delay
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }, 2000);
    }

    return {
      success: false,
      error,
      shouldLogout,
    };
  }

  /**
   * Check if we should stop retrying based on recent attempts
   */
  private shouldStopRetrying(): boolean {
    const now = Date.now();
    const recentAttempts = this.refreshAttempts.filter(
      attempt => now - attempt.timestamp < 5 * 60 * 1000 // Last 5 minutes
    );

    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
    return failedAttempts.length >= this.maxRetries;
  }

  /**
   * Record a successful refresh attempt
   */
  private recordSuccessfulRefresh(): void {
    this.refreshAttempts.push({
      timestamp: Date.now(),
      success: true,
    });

    // Keep only recent attempts
    this.cleanupOldAttempts();
  }

  /**
   * Record a failed refresh attempt
   */
  private recordFailedRefresh(error: string): void {
    this.refreshAttempts.push({
      timestamp: Date.now(),
      success: false,
      error,
    });

    // Keep only recent attempts
    this.cleanupOldAttempts();
  }

  /**
   * Clean up old refresh attempts
   */
  private cleanupOldAttempts(): void {
    const now = Date.now();
    this.refreshAttempts = this.refreshAttempts.filter(
      attempt => now - attempt.timestamp < 10 * 60 * 1000 // Keep last 10 minutes
    );
  }

  /**
   * Utility function to delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if currently refreshing
   */
  isCurrentlyRefreshing(): boolean {
    return this.isRefreshing;
  }

  /**
   * Get refresh attempt history (for debugging)
   */
  getRefreshHistory(): RefreshAttempt[] {
    return [...this.refreshAttempts];
  }

  /**
   * Reset refresh attempt history
   */
  resetHistory(): void {
    this.refreshAttempts = [];
  }

  /**
   * Force stop any ongoing refresh
   */
  forceStop(): void {
    this.refreshPromise = null;
    this.isRefreshing = false;
  }
}

// Create singleton instance
export const advancedTokenRefreshService = new AdvancedTokenRefreshService();

// Export class for testing
export { AdvancedTokenRefreshService };
