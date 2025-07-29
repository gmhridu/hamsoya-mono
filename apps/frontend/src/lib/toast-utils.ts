// Enhanced toast utilities for comprehensive error handling

import { toast } from 'sonner';
import { formatError, type ErrorSeverity, logError, type ErrorContext } from './error-constants';

// Enhanced toast options
interface EnhancedToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

// Toast with retry functionality
interface RetryToastOptions extends EnhancedToastOptions {
  onRetry?: () => void;
  retryLabel?: string;
}

// Enhanced toast functions
export class EnhancedToast {
  // Show error toast with enhanced formatting
  static error(error: any, options?: RetryToastOptions & { context?: ErrorContext }) {
    const errorInfo = formatError(error);
    
    // Log error for debugging
    logError(error, options?.context);

    const toastOptions: any = {
      duration: options?.duration || 5000,
      dismissible: options?.dismissible !== false,
    };

    // Add retry action if provided
    if (options?.onRetry) {
      toastOptions.action = {
        label: options.retryLabel || errorInfo.action,
        onClick: options.onRetry,
      };
    }

    return toast.error(errorInfo.message, toastOptions);
  }

  // Show success toast
  static success(message: string, options?: EnhancedToastOptions) {
    return toast.success(message, {
      duration: options?.duration || 3000,
      dismissible: options?.dismissible !== false,
      action: options?.action,
    });
  }

  // Show warning toast
  static warning(message: string, options?: EnhancedToastOptions) {
    return toast.warning(message, {
      duration: options?.duration || 4000,
      dismissible: options?.dismissible !== false,
      action: options?.action,
    });
  }

  // Show info toast
  static info(message: string, options?: EnhancedToastOptions) {
    return toast.info(message, {
      duration: options?.duration || 3000,
      dismissible: options?.dismissible !== false,
      action: options?.action,
    });
  }

  // Show loading toast
  static loading(message: string = 'Loading...') {
    return toast.loading(message);
  }

  // Dismiss specific toast
  static dismiss(toastId?: string | number) {
    return toast.dismiss(toastId);
  }

  // Dismiss all toasts
  static dismissAll() {
    return toast.dismiss();
  }

  // Promise toast with enhanced error handling
  static promise<T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
      context,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error?: string | ((error: any) => string);
      context?: ErrorContext;
    }
  ) {
    return toast.promise(promise, {
      loading,
      success,
      error: (err) => {
        // Log error with context
        logError(err, context);
        
        if (typeof error === 'function') {
          return error(err);
        }
        
        if (typeof error === 'string') {
          return error;
        }
        
        // Use enhanced error formatting
        const errorInfo = formatError(err);
        return errorInfo.message;
      },
    });
  }
}

// OTP-specific toast utilities
export class OTPToast {
  // OTP sent successfully
  static otpSent(email: string, cooldownSeconds?: number) {
    let message = `Verification code sent to ${email}`;
    if (cooldownSeconds) {
      message += `. You can request a new code in ${cooldownSeconds} seconds.`;
    }
    
    return EnhancedToast.success(message, {
      duration: 4000,
    });
  }

  // OTP verified successfully
  static otpVerified() {
    return EnhancedToast.success('Email verified successfully! 🎉', {
      duration: 3000,
    });
  }

  // OTP verification failed with retry
  static otpFailed(error: any, onRetry?: () => void) {
    return EnhancedToast.error(error, {
      onRetry,
      retryLabel: 'Try Again',
      context: {
        component: 'OTPVerification',
        action: 'verify',
      },
    });
  }

  // Rate limit reached
  static rateLimited(cooldownSeconds: number) {
    const minutes = Math.floor(cooldownSeconds / 60);
    const seconds = cooldownSeconds % 60;
    const timeStr = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`;
    
    return EnhancedToast.warning(
      `Too many requests. Please wait ${timeStr} before trying again.`,
      {
        duration: 6000,
      }
    );
  }

  // Account locked
  static accountLocked(lockDurationMinutes: number = 15) {
    return EnhancedToast.error(
      `Account temporarily locked due to too many failed attempts. Please try again in ${lockDurationMinutes} minutes.`,
      {
        duration: 8000,
      }
    );
  }

  // Network error with retry
  static networkError(onRetry?: () => void) {
    return EnhancedToast.error(
      {
        message: 'Network error. Please check your connection.',
        errorCode: 'NETWORK_ERROR',
      },
      {
        onRetry,
        retryLabel: 'Retry',
        context: {
          component: 'OTPVerification',
          action: 'network',
        },
      }
    );
  }

  // Cooldown active
  static cooldownActive(remainingSeconds: number) {
    const timeStr = remainingSeconds > 60 
      ? `${Math.floor(remainingSeconds / 60)}:${(remainingSeconds % 60).toString().padStart(2, '0')}`
      : `${remainingSeconds}s`;
    
    return EnhancedToast.info(
      `Please wait ${timeStr} before requesting another code.`,
      {
        duration: 3000,
      }
    );
  }
}

// Authentication-specific toast utilities
export class AuthToast {
  // Registration started
  static registrationStarted(email: string) {
    return EnhancedToast.info(
      `Registration initiated for ${email}. Please check your email for verification.`,
      {
        duration: 5000,
      }
    );
  }

  // Login successful
  static loginSuccess() {
    return EnhancedToast.success('Welcome back! 👋', {
      duration: 2000,
    });
  }

  // Logout successful
  static logoutSuccess() {
    return EnhancedToast.success('Logged out successfully', {
      duration: 2000,
    });
  }

  // Password reset initiated
  static passwordResetInitiated(email: string) {
    return EnhancedToast.info(
      `Password reset instructions sent to ${email}`,
      {
        duration: 4000,
      }
    );
  }

  // Password reset successful
  static passwordResetSuccess() {
    return EnhancedToast.success('Password reset successfully! Please log in with your new password.', {
      duration: 4000,
    });
  }

  // Session expired
  static sessionExpired() {
    return EnhancedToast.warning('Your session has expired. Please log in again.', {
      duration: 5000,
    });
  }
}

// Utility functions for toast management
export const toastUtils = {
  // Clear all toasts before showing a new one
  clearAndShow: (toastFn: () => any) => {
    EnhancedToast.dismissAll();
    return toastFn();
  },

  // Show toast only if not already showing
  showOnce: (() => {
    const activeToasts = new Set<string>();
    
    return (key: string, toastFn: () => any) => {
      if (!activeToasts.has(key)) {
        activeToasts.add(key);
        const toastId = toastFn();
        
        // Remove from active set when toast is dismissed
        setTimeout(() => {
          activeToasts.delete(key);
        }, 5000);
        
        return toastId;
      }
    };
  })(),

  // Batch multiple toasts with delay
  batch: async (toasts: Array<() => any>, delay: number = 500) => {
    for (const toastFn of toasts) {
      toastFn();
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },
};

// Export default enhanced toast
export default EnhancedToast;
