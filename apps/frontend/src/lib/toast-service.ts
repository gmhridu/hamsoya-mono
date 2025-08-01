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
   * Authentication-specific toasts
   */
  auth = {
    loginSuccess: () => this.success('Welcome back! 👋', { duration: 2000 }),
    loginError: (error: string) => this.error(`Login failed: ${error}`),
    logoutSuccess: () => this.success('Logged out successfully', { duration: 2000 }),
    registrationSuccess: (email: string) => 
      this.success(`Registration successful! Please check ${email} for verification.`, { duration: 5000 }),
    registrationError: (error: string) => this.error(`Registration failed: ${error}`),
    tokenRefreshSuccess: () => this.showOnce('token-refresh', () => 
      this.info('Session refreshed', { duration: 1000 })),
    tokenRefreshError: () => this.showOnce('token-refresh-error', () => 
      this.error('Session expired. Please log in again.', { duration: 3000 })),
    emailVerificationSent: (email: string) => 
      this.success(`Verification email sent to ${email}`, { duration: 4000 }),
    emailVerificationSuccess: () => this.success('Email verified successfully! 🎉', { duration: 3000 }),
    emailVerificationError: (error: string) => this.error(`Verification failed: ${error}`),
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
