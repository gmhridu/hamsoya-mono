'use client';

import { useEffect } from 'react';
import { enhancedTokenManager } from '@/lib/enhanced-token-manager';
import { advancedTokenRefreshService } from '@/lib/advanced-token-refresh';
import { enhancedLogoutService } from '@/lib/enhanced-logout-service';
import { authErrorHandler } from '@/lib/auth-error-handler';
import { secureStorage } from '@/lib/secure-storage';
import { secureCookieManager } from '@/lib/secure-cookie-manager';

/**
 * Comprehensive Authentication Initializer
 * Sets up all enhanced authentication features including:
 * - Enhanced token management and cleanup
 * - Advanced token refresh with fallback
 * - Comprehensive logout and session management
 * - Error handling and user feedback
 */
export function ComprehensiveAuthInitializer() {
  useEffect(() => {
    // Initialize enhanced token manager
    enhancedTokenManager.initialize();

    // Initialize secure storage and migrate existing data
    initializeSecureStorage();

    // Initialize secure cookie management
    initializeSecureCookies();

    // Set up global error handlers for authentication
    setupGlobalErrorHandlers();

    // Set up network monitoring
    setupNetworkMonitoring();

    // Set up visibility change monitoring
    setupVisibilityMonitoring();

    // Cleanup on unmount
    return () => {
      enhancedTokenManager.destroy();
      advancedTokenRefreshService.forceStop();
      enhancedLogoutService.forceStop();
      authErrorHandler.clearStats();
    };
  }, []);

  return null;
}

/**
 * Initialize secure storage and migrate existing data
 */
function initializeSecureStorage() {
  if (typeof window === 'undefined') return;

  // Migrate existing auth data to secure storage
  secureStorage.migrateExistingData([
    'hamsoya-auth-user',
    'hamsoya-auth-state',
  ]);
}

/**
 * Initialize secure cookie management
 */
async function initializeSecureCookies() {
  if (typeof window === 'undefined') return;

  try {
    // Migrate localStorage data to secure cookies
    await secureCookieManager.migrateToSecureCookies();

    // Clean up unnecessary cookies
    await secureCookieManager.cleanupUnnecessaryCookies();
  } catch (error) {
    console.warn('Failed to initialize secure cookies:', error);
  }
}

/**
 * Set up global error handlers for authentication
 */
function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (isAuthRelatedError(event.reason)) {
      authErrorHandler.handleAuthError(
        event.reason,
        'unhandled_promise_rejection',
        { showToast: false, logError: true }
      );
    }
  };

  // Handle global errors
  const handleGlobalError = (event: ErrorEvent) => {
    if (isAuthRelatedError(event.error)) {
      authErrorHandler.handleAuthError(
        event.error,
        'global_error',
        { showToast: false, logError: true }
      );
    }
  };

  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  window.addEventListener('error', handleGlobalError);

  // Store cleanup functions
  (window as any).__authErrorCleanup = () => {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    window.removeEventListener('error', handleGlobalError);
  };
}

/**
 * Set up network monitoring for authentication
 */
function setupNetworkMonitoring() {
  if (typeof window === 'undefined') return;

  const handleOnline = () => {
    // When coming back online, validate tokens
    setTimeout(() => {
      if (enhancedTokenManager.areTokensValid()) {
        // Tokens are valid, continue
      } else {
        // Tokens might be invalid, trigger cleanup
        enhancedTokenManager.forceCleanup('Network reconnection - invalid tokens');
      }
    }, 1000);
  };

  const handleOffline = () => {
    // When going offline, stop token refresh attempts
    advancedTokenRefreshService.forceStop();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Store cleanup functions
  (window as any).__networkCleanup = () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Set up visibility change monitoring
 */
function setupVisibilityMonitoring() {
  if (typeof window === 'undefined') return;

  const handleVisibilityChange = () => {
    if (!document.hidden) {
      // Page became visible, check token validity
      setTimeout(() => {
        enhancedTokenManager.initialize(); // This will trigger cleanup if needed
      }, 500);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Store cleanup function
  (window as any).__visibilityCleanup = () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

/**
 * Check if an error is authentication-related
 */
function isAuthRelatedError(error: any): boolean {
  if (!error) return false;

  const errorString = error.toString().toLowerCase();
  const authKeywords = [
    'token',
    'auth',
    'login',
    'session',
    'unauthorized',
    'forbidden',
    'jwt',
    'refresh',
  ];

  return authKeywords.some(keyword => errorString.includes(keyword));
}
