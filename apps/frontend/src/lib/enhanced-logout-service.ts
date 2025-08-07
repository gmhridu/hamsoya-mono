/**
 * Enhanced Logout Service
 * Provides robust logout functionality that completely clears all authentication cookies,
 * handles edge cases, and provides seamless UI/UX with proper loading states.
 */

'use client';

import { enhancedTokenManager } from './enhanced-token-manager';
import { advancedTokenRefreshService } from './advanced-token-refresh';
import { useAuthStore } from '@/store/auth-store';
import { toastService } from './toast-service';

interface LogoutOptions {
  showToast?: boolean;
  redirectTo?: string;
  reason?: string;
  skipBackendCall?: boolean;
}

interface LogoutResult {
  success: boolean;
  error?: string;
  redirected: boolean;
}

class EnhancedLogoutService {
  private isLoggingOut = false;
  private logoutPromise: Promise<LogoutResult> | null = null;

  /**
   * Perform comprehensive logout with all cleanup
   */
  async logout(options: LogoutOptions = {}): Promise<LogoutResult> {
    // Prevent multiple simultaneous logout attempts
    if (this.logoutPromise) {
      return this.logoutPromise;
    }

    this.logoutPromise = this.performLogout(options);
    const result = await this.logoutPromise;
    this.logoutPromise = null;

    return result;
  }

  /**
   * Perform the actual logout process
   */
  private async performLogout(options: LogoutOptions): Promise<LogoutResult> {
    this.isLoggingOut = true;
    let toastId: string | number | null = null;

    try {
      // Show loading toast if requested
      if (options.showToast !== false) {
        toastId = toastService.auth.signingOut();
      }

      // Stop any ongoing token refresh
      advancedTokenRefreshService.forceStop();

      // Call backend logout if not skipped
      if (!options.skipBackendCall) {
        await this.callBackendLogout();
      }

      // Perform comprehensive cleanup
      this.performComprehensiveCleanup(options.reason || 'User logout');

      // Show success toast
      if (options.showToast !== false && toastId) {
        toastService.auth.logoutSuccess(toastId);
      }

      // Handle redirect
      const redirected = this.handleRedirect(options.redirectTo);

      return {
        success: true,
        redirected,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      console.error('Logout error:', errorMessage);

      // Still perform cleanup even if backend call failed
      this.performComprehensiveCleanup(`Logout error: ${errorMessage}`);

      // Show error toast
      if (options.showToast !== false) {
        if (toastId) {
          toastService.replaceWithError(toastId, 'Logout completed with errors');
        } else {
          toastService.error('Logout completed with errors');
        }
      }

      // Still redirect even on error
      const redirected = this.handleRedirect(options.redirectTo);

      return {
        success: false,
        error: errorMessage,
        redirected,
      };
    } finally {
      this.isLoggingOut = false;
    }
  }

  /**
   * Call backend logout API
   */
  private async callBackendLogout(): Promise<void> {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Don't throw error if backend logout fails - we'll still clean up locally
      if (!response.ok) {
        console.warn('Backend logout failed, but continuing with local cleanup');
      }
    } catch (error) {
      console.warn('Backend logout request failed:', error);
      // Continue with local cleanup
    }
  }

  /**
   * Perform comprehensive cleanup of all authentication data
   */
  private performComprehensiveCleanup(reason: string): void {
    // Use enhanced token manager for comprehensive token cleanup
    enhancedTokenManager.forceCleanup(reason);

    // Clear auth store
    const { logout: storeLogout } = useAuthStore.getState();
    storeLogout();

    // Clear any additional storage items
    this.clearAdditionalStorage();

    // Reset refresh attempt history
    advancedTokenRefreshService.resetHistory();
  }

  /**
   * Clear additional storage items that might contain user data
   */
  private clearAdditionalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      // Clear localStorage items
      if (typeof localStorage !== 'undefined') {
        const keysToRemove: string[] = [];
        
        // Collect keys to remove
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && this.shouldClearStorageKey(key)) {
            keysToRemove.push(key);
          }
        }
        
        // Remove collected keys
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }

      // Clear sessionStorage items
      if (typeof sessionStorage !== 'undefined') {
        const keysToRemove: string[] = [];
        
        // Collect keys to remove
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && this.shouldClearStorageKey(key)) {
            keysToRemove.push(key);
          }
        }
        
        // Remove collected keys
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
      }
    } catch (error) {
      console.warn('Error clearing additional storage:', error);
    }
  }

  /**
   * Determine if a storage key should be cleared during logout
   */
  private shouldClearStorageKey(key: string): boolean {
    const patterns = [
      'auth',
      'token',
      'user',
      'session',
      'login',
      'hamsoya-auth',
      'cart', // Clear cart data on logout
      'preferences', // Clear user preferences
    ];

    return patterns.some(pattern => key.toLowerCase().includes(pattern));
  }

  /**
   * Handle post-logout redirect
   */
  private handleRedirect(redirectTo?: string): boolean {
    if (typeof window === 'undefined') return false;

    const destination = redirectTo || '/login';
    
    try {
      // Use window.location for immediate redirect
      window.location.href = destination;
      return true;
    } catch (error) {
      console.error('Redirect failed:', error);
      return false;
    }
  }

  /**
   * Quick logout without backend call (for emergency situations)
   */
  async quickLogout(reason: string = 'Quick logout'): Promise<LogoutResult> {
    return this.logout({
      skipBackendCall: true,
      showToast: false,
      reason,
    });
  }

  /**
   * Silent logout (no toasts, no redirect)
   */
  async silentLogout(reason: string = 'Silent logout'): Promise<LogoutResult> {
    this.performComprehensiveCleanup(reason);
    
    return {
      success: true,
      redirected: false,
    };
  }

  /**
   * Check if currently logging out
   */
  isCurrentlyLoggingOut(): boolean {
    return this.isLoggingOut;
  }

  /**
   * Force stop any ongoing logout process
   */
  forceStop(): void {
    this.logoutPromise = null;
    this.isLoggingOut = false;
  }
}

// Create singleton instance
export const enhancedLogoutService = new EnhancedLogoutService();

// Export class for testing
export { EnhancedLogoutService };
