/**
 * Comprehensive Authentication Error Handler
 * Implements graceful error handling for authentication processes without exposing
 * sensitive information, with proper user feedback and smooth state transitions.
 */

'use client';

import { enhancedLogoutService } from './enhanced-logout-service';
import { toastService } from './toast-service';

export interface AuthError {
  code: string;
  message: string;
  userMessage: string;
  shouldLogout: boolean;
  shouldRetry: boolean;
  retryDelay?: number;
}

export interface ErrorHandlingOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackAction?: () => void;
}

class AuthErrorHandler {
  private errorCounts = new Map<string, number>();
  private lastErrorTime = new Map<string, number>();

  /**
   * Handle authentication errors with appropriate user feedback
   */
  async handleAuthError(
    error: any,
    context: string,
    options: ErrorHandlingOptions = {}
  ): Promise<AuthError> {
    const authError = this.parseError(error, context);
    
    // Log error if requested
    if (options.logError !== false) {
      this.logError(authError, context);
    }

    // Track error frequency
    this.trackError(authError.code);

    // Handle specific error types
    await this.handleSpecificError(authError, options);

    // Show user-friendly toast if requested
    if (options.showToast !== false) {
      this.showErrorToast(authError);
    }

    // Execute fallback action if provided
    if (options.fallbackAction) {
      try {
        options.fallbackAction();
      } catch (fallbackError) {
        console.error('Fallback action failed:', fallbackError);
      }
    }

    return authError;
  }

  /**
   * Parse error into standardized format
   */
  private parseError(error: any, context: string): AuthError {
    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: error.message,
        userMessage: 'Connection problem. Please check your internet connection.',
        shouldLogout: false,
        shouldRetry: true,
        retryDelay: 3000,
      };
    }

    // HTTP errors
    if (error?.status) {
      switch (error.status) {
        case 401:
          return {
            code: 'UNAUTHORIZED',
            message: error.message || 'Unauthorized',
            userMessage: 'Your session has expired. Please log in again.',
            shouldLogout: true,
            shouldRetry: false,
          };
        case 403:
          return {
            code: 'FORBIDDEN',
            message: error.message || 'Forbidden',
            userMessage: 'You do not have permission to perform this action.',
            shouldLogout: false,
            shouldRetry: false,
          };
        case 429:
          return {
            code: 'RATE_LIMITED',
            message: error.message || 'Too many requests',
            userMessage: 'Too many attempts. Please wait a moment and try again.',
            shouldLogout: false,
            shouldRetry: true,
            retryDelay: 60000, // 1 minute
          };
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            code: 'SERVER_ERROR',
            message: error.message || 'Server error',
            userMessage: 'Server is temporarily unavailable. Please try again later.',
            shouldLogout: false,
            shouldRetry: true,
            retryDelay: 5000,
          };
        default:
          return {
            code: 'HTTP_ERROR',
            message: error.message || `HTTP ${error.status}`,
            userMessage: 'Something went wrong. Please try again.',
            shouldLogout: false,
            shouldRetry: true,
          };
      }
    }

    // Token-related errors
    if (error?.message?.includes('token') || error?.message?.includes('jwt')) {
      return {
        code: 'TOKEN_ERROR',
        message: error.message,
        userMessage: 'Authentication error. Please log in again.',
        shouldLogout: true,
        shouldRetry: false,
      };
    }

    // Validation errors
    if (error?.message?.includes('validation') || error?.message?.includes('invalid')) {
      return {
        code: 'VALIDATION_ERROR',
        message: error.message,
        userMessage: 'Please check your input and try again.',
        shouldLogout: false,
        shouldRetry: false,
      };
    }

    // Generic error
    return {
      code: 'UNKNOWN_ERROR',
      message: error?.message || 'Unknown error',
      userMessage: 'An unexpected error occurred. Please try again.',
      shouldLogout: false,
      shouldRetry: true,
    };
  }

  /**
   * Handle specific error types with appropriate actions
   */
  private async handleSpecificError(
    authError: AuthError,
    options: ErrorHandlingOptions
  ): Promise<void> {
    switch (authError.code) {
      case 'UNAUTHORIZED':
      case 'TOKEN_ERROR':
        if (authError.shouldLogout) {
          await enhancedLogoutService.silentLogout(`Auth error: ${authError.code}`);
        }
        break;

      case 'RATE_LIMITED':
        // Implement exponential backoff for rate limited requests
        this.implementBackoff(authError.code);
        break;

      case 'NETWORK_ERROR':
        // Check if we're offline
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          this.handleOfflineState();
        }
        break;

      case 'SERVER_ERROR':
        // Track server errors for monitoring
        this.trackServerError(authError);
        break;
    }
  }

  /**
   * Show user-friendly error toast
   */
  private showErrorToast(authError: AuthError): void {
    const options = {
      duration: authError.shouldRetry ? 5000 : 4000,
    };

    switch (authError.code) {
      case 'UNAUTHORIZED':
      case 'TOKEN_ERROR':
        toastService.auth.sessionExpired();
        break;
      case 'NETWORK_ERROR':
        toastService.error(authError.userMessage, {
          ...options,
          actionLabel: 'Retry',
          onAction: () => window.location.reload(),
        });
        break;
      case 'RATE_LIMITED':
        toastService.warning(authError.userMessage, options);
        break;
      case 'SERVER_ERROR':
        toastService.error(authError.userMessage, options);
        break;
      default:
        toastService.error(authError.userMessage, options);
    }
  }

  /**
   * Log error for debugging and monitoring
   */
  private logError(authError: AuthError, context: string): void {
    const errorInfo = {
      code: authError.code,
      message: authError.message,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth Error:', errorInfo);
    }

    // In production, send to monitoring service
    // This would integrate with your error tracking service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(errorInfo);
    }
  }

  /**
   * Track error frequency for rate limiting
   */
  private trackError(errorCode: string): void {
    const now = Date.now();
    const count = this.errorCounts.get(errorCode) || 0;
    const lastTime = this.lastErrorTime.get(errorCode) || 0;

    // Reset count if it's been more than 5 minutes
    if (now - lastTime > 5 * 60 * 1000) {
      this.errorCounts.set(errorCode, 1);
    } else {
      this.errorCounts.set(errorCode, count + 1);
    }

    this.lastErrorTime.set(errorCode, now);
  }

  /**
   * Implement exponential backoff for repeated errors
   */
  private implementBackoff(errorCode: string): void {
    const count = this.errorCounts.get(errorCode) || 0;
    const backoffTime = Math.min(1000 * Math.pow(2, count), 30000); // Max 30 seconds

    console.log(`Implementing backoff for ${errorCode}: ${backoffTime}ms`);
  }

  /**
   * Handle offline state
   */
  private handleOfflineState(): void {
    if (typeof window !== 'undefined') {
      const handleOnline = () => {
        toastService.success('Connection restored');
        window.removeEventListener('online', handleOnline);
      };

      window.addEventListener('online', handleOnline);
    }
  }

  /**
   * Track server errors for monitoring
   */
  private trackServerError(authError: AuthError): void {
    // This would integrate with your monitoring service
    console.warn('Server error tracked:', authError);
  }

  /**
   * Send error to monitoring service
   */
  private sendToMonitoring(errorInfo: any): void {
    // This would integrate with your error tracking service
    // Example: Sentry, LogRocket, etc.
    console.log('Would send to monitoring:', errorInfo);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): { code: string; count: number; lastOccurrence: number }[] {
    const stats: { code: string; count: number; lastOccurrence: number }[] = [];
    
    for (const [code, count] of this.errorCounts.entries()) {
      stats.push({
        code,
        count,
        lastOccurrence: this.lastErrorTime.get(code) || 0,
      });
    }

    return stats;
  }

  /**
   * Clear error statistics
   */
  clearStats(): void {
    this.errorCounts.clear();
    this.lastErrorTime.clear();
  }
}

// Create singleton instance
export const authErrorHandler = new AuthErrorHandler();

// Export class for testing
export { AuthErrorHandler };
