/**
 * Toast Service
 * Centralized toast notification system using Sonner
 * Provides consistent user feedback without causing re-renders
 */

import { toast } from 'sonner';

export interface ToastOptions {
  duration?: number;
  dismissible?: boolean;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export interface ActionToastOptions extends ToastOptions {
  actionLabel?: string;
  onAction?: () => void;
}

class ToastService {
  private activeToasts = new Set<string>();

  /**
   * Show success toast
   */
  success(message: string, options?: ToastOptions): string | number {
    return toast.success(message, {
      duration: options?.duration || 3000,
      dismissible: options?.dismissible !== false,
    });
  }

  /**
   * Show error toast
   */
  error(message: string, options?: ActionToastOptions): string | number {
    const toastOptions: any = {
      duration: options?.duration || 5000,
      dismissible: options?.dismissible !== false,
    };

    if (options?.onAction && options?.actionLabel) {
      toastOptions.action = {
        label: options.actionLabel,
        onClick: options.onAction,
      };
    }

    return toast.error(message, toastOptions);
  }

  /**
   * Show warning toast
   */
  warning(message: string, options?: ToastOptions): string | number {
    return toast.warning(message, {
      duration: options?.duration || 4000,
      dismissible: options?.dismissible !== false,
    });
  }

  /**
   * Show info toast
   */
  info(message: string, options?: ToastOptions): string | number {
    return toast.info(message, {
      duration: options?.duration || 3000,
      dismissible: options?.dismissible !== false,
    });
  }

  /**
   * Show loading toast
   */
  loading(message: string, options?: ToastOptions): string | number {
    return toast.loading(message, {
      duration: options?.duration || Infinity,
      dismissible: options?.dismissible !== false,
    });
  }

  /**
   * Update an existing toast with new content
   * Uses dismiss + new toast approach for reliable replacement
   */
  update(toastId: string | number, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success'): void {
    // Dismiss the existing loading toast
    this.dismiss(toastId);

    // Show new toast with same ID after a brief delay to ensure clean replacement
    setTimeout(() => {
      const options = {
        id: toastId,
        duration: type === 'error' ? 4000 : 3000,
      };

      switch (type) {
        case 'success':
          toast.success(message, options);
          break;
        case 'error':
          toast.error(message, options);
          break;
        case 'warning':
          toast.warning(message, options);
          break;
        case 'info':
          toast.info(message, options);
          break;
      }
    }, 100);
  }

  /**
   * Replace a loading toast with a success toast
   * More explicit method for better reliability
   */
  replaceWithSuccess(toastId: string | number, message: string): void {
    this.dismiss(toastId);
    setTimeout(() => {
      toast.success(message, { duration: 3000 });
    }, 100);
  }

  /**
   * Replace a loading toast with an error toast
   * More explicit method for better reliability
   */
  replaceWithError(toastId: string | number, message: string): void {
    this.dismiss(toastId);
    setTimeout(() => {
      toast.error(message, { duration: 4000 });
    }, 100);
  }

  /**
   * Dismiss a specific toast
   */
  dismiss(toastId: string | number): void {
    toast.dismiss(toastId);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll(): void {
    toast.dismiss();
    this.activeToasts.clear();
  }

  /**
   * Show toast only once (prevent duplicates)
   */
  showOnce(key: string, toastFn: () => string | number): string | number | null {
    if (this.activeToasts.has(key)) {
      return null;
    }

    this.activeToasts.add(key);
    const toastId = toastFn();

    // Remove from active set after 5 seconds
    setTimeout(() => {
      this.activeToasts.delete(key);
    }, 5000);

    return toastId;
  }

  /**
   * Authentication-specific toasts with loading state management
   */
  auth = {
    // Sign in flow
    signingIn: () => this.loading('Signing in...'),
    loginSuccess: (username?: string, toastId?: string | number) => {
      const message = username ? `Welcome back ${username}! 👋` : 'Welcome back! 👋';
      if (toastId) {
        this.replaceWithSuccess(toastId, message);
      } else {
        return this.success(message, { duration: 3000 });
      }
    },
    loginError: (error: string, toastId?: string | number) => {
      const message = `Login failed: ${error}`;
      if (toastId) {
        this.replaceWithError(toastId, message);
      } else {
        return this.error(message);
      }
    },

    // Sign out flow
    signingOut: () => this.loading('Signing out...'),
    logoutSuccess: (toastId?: string | number) => {
      const message = 'Signed out successfully';
      if (toastId) {
        this.replaceWithSuccess(toastId, message);
      } else {
        return this.success(message, { duration: 3000 });
      }
    },

    // Registration
    registrationSuccess: (email: string) =>
      this.success(`Registration successful! Please check ${email} for verification.`, { duration: 5000 }),
    registrationError: (error: string) => this.error(`Registration failed: ${error}`),

    // Token management
    tokenRefreshSuccess: () => this.showOnce('token-refresh', () =>
      this.info('Session refreshed', { duration: 1000 })),
    tokenRefreshError: () => this.showOnce('token-refresh-error', () =>
      this.error('Session expired. Please log in again.', { duration: 3000 })),
    sessionExpired: () => this.showOnce('session-expired', () =>
      this.warning('Your session has expired. Please log in again.', { duration: 4000 })),

    // Forgot password flow
    sendingOTP: () => this.loading('Sending verification code...'),
    otpSent: () => this.success('Verification code sent! Please check your email.', { duration: 4000 }),
    verifyingOTP: () => this.loading('Verifying code...'),
    otpVerified: () => this.success('Code verified successfully!', { duration: 3000 }),
    resettingPassword: () => this.loading('Resetting password...'),
    passwordReset: () => this.success('Password reset successfully! You can now sign in.', { duration: 4000 }),
    error: (message: string) => this.error(message),
  };

  /**
   * Checkout-specific toasts with loading state management
   */
  checkout = {
    // Checkout flow
    processingCheckout: () => this.loading('Preparing checkout...'),
    checkoutSuccess: (toastId?: string | number) => {
      const message = 'Redirecting to checkout page...';
      if (toastId) {
        this.replaceWithSuccess(toastId, message);
      } else {
        return this.success(message, { duration: 3000 });
      }
    },
    checkoutError: (error: string, toastId?: string | number) => {
      const message = `Checkout failed: ${error}`;
      if (toastId) {
        this.replaceWithError(toastId, message);
      } else {
        return this.error(message);
      }
    },
  };

  /**
   * Email verification and password reset toasts
   */
  email = {
    verificationSent: (email: string) =>
      this.success(`Verification email sent to ${email}`, { duration: 4000 }),
    verificationSuccess: () => this.success('Email verified successfully! 🎉', { duration: 3000 }),
    verificationError: (error: string) => this.error(`Verification failed: ${error}`),
    passwordResetSent: (email: string) =>
      this.info(`Password reset instructions sent to ${email}`, { duration: 4000 }),
    passwordResetSuccess: () => this.success('Password reset successfully', { duration: 3000 }),
    passwordResetError: (error: string) => this.error(`Password reset failed: ${error}`),
  };

  /**
   * Cart-specific toasts
   */
  cart = {
    itemAdded: (productName: string) =>
      this.success(`${productName} added to cart`, { duration: 2000 }),
    itemRemoved: (productName: string) =>
      this.info(`${productName} removed from cart`, { duration: 2000 }),
    itemUpdated: (productName: string, quantity: number) =>
      this.info(`${productName} quantity updated to ${quantity}`, { duration: 2000 }),
    cartCleared: () => this.info('Cart cleared', { duration: 2000 }),
    cartError: (error: string) => this.error(`Cart error: ${error}`),
  };

  /**
   * Bookmark-specific toasts
   */
  bookmarks = {
    itemAdded: (productName: string) =>
      this.success(`${productName} bookmarked`, { duration: 2000 }),
    itemRemoved: (productName: string) =>
      this.info(`${productName} removed from bookmarks`, { duration: 2000 }),
    bookmarksCleared: () => this.info('All bookmarks cleared', { duration: 2000 }),
    bookmarkError: (error: string) => this.error(`Bookmark error: ${error}`),
  };

  /**
   * Order-specific toasts
   */
  order = {
    orderPlaced: (orderId: string) =>
      this.success(`Order #${orderId} placed successfully! 🎉`, { duration: 5000 }),
    orderError: (error: string) => this.error(`Order failed: ${error}`),
    paymentSuccess: () => this.success('Payment processed successfully', { duration: 3000 }),
    paymentError: (error: string) => this.error(`Payment failed: ${error}`),
  };

  /**
   * General application toasts
   */
  app = {
    networkError: () => this.error('Network error. Please check your connection.', {
      actionLabel: 'Retry',
      onAction: () => window.location.reload(),
    }),
    unexpectedError: () => this.error('Something went wrong. Please try again.'),
    featureNotAvailable: () => this.info('This feature is not available yet'),
    copySuccess: () => this.success('Copied to clipboard', { duration: 1500 }),
    saveSuccess: () => this.success('Saved successfully', { duration: 2000 }),
    saveError: (error: string) => this.error(`Save failed: ${error}`),
  };
}

// Create singleton instance
export const toastService = new ToastService();

// Export individual methods for convenience
export const {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  dismiss: dismissToast,
  dismissAll: dismissAllToasts,
} = toastService;
