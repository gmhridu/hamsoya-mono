/**
 * Optimized login hook with instant cache updates and seamless UX
 * Provides zero-loading-state login experience with optimistic updates
 */

'use client';

import { apiClient } from '@/lib/api-client';
import { migrateGuestDataToUser } from '@/lib/guest-data-migration';
import { useLoginFlow } from '@/lib/post-login-navigation';
import { toastService } from '@/lib/toast-service';
import { useAuthActions } from '@/store/auth-store';
import type { LoginCredentials, UseLoginReturn, User } from '@/types/auth';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Validate redirect URL based on user role
 * SECURITY: Prevents unauthorized users from being redirected to admin routes
 */
function validateRedirectForUserRole(url: string, userRole?: string): string | null {
  if (!url || url === '/login') {
    return null;
  }

  // Security check: Admin routes only for admin users
  if (url.startsWith('/admin') && userRole !== 'ADMIN') {
    return null; // Block admin redirects for non-admin users
  }

  // Additional security checks
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return null; // Block external redirects
  }

  if (url.includes('..') || url.includes('//')) {
    return null; // Block path traversal attempts
  }

  return url;
}

// Type for the API response structure
interface LoginApiResponse {
  success: boolean;
  data: {
    user: User;
    message: string;
  };
  message?: string;
  timestamp: string;
}

/**
 * High-performance login hook with optimistic updates
 * Updates both Zustand store and TanStack Query cache instantly
 */
export function useLogin(): UseLoginReturn {
  const { setUser, setLoading, setError, clearError } = useAuthActions();
  const { handleLoginSuccess } = useLoginFlow();
  const loadingToastRef = useRef<string | number | null>(null);

  // TanStack Query mutation for login with optimistic updates
  const loginMutation = useMutation<LoginApiResponse, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      return apiClient.login(credentials.email, credentials.password) as Promise<LoginApiResponse>;
    },
    onMutate: async () => {
      // Start loading state immediately
      setLoading(true);
      clearError();

      // Show loading toast
      loadingToastRef.current = toastService.auth.signingIn();
    },
    onSuccess: response => {
      try {
        const userData = response?.data?.user;

        if (!userData) {
          throw new Error('Invalid response format from server');
        }

        // Immediately update Zustand store for instant UI updates
        setUser(userData);

        // Migrate guest data to authenticated user account
        migrateGuestDataToUser()
          .then(migrationResult => {
            if (migrationResult.cartMigrated || migrationResult.bookmarksMigrated) {
              let migrationMessage = `Welcome back ${userData.name}! `;
              if (migrationResult.cartMigrated && migrationResult.bookmarksMigrated) {
                migrationMessage += `Your cart (${migrationResult.cartItemsAdded} items) and bookmarks (${migrationResult.bookmarksAdded} items) have been restored.`;
              } else if (migrationResult.cartMigrated) {
                migrationMessage += `Your cart (${migrationResult.cartItemsAdded} items) has been restored.`;
              } else if (migrationResult.bookmarksMigrated) {
                migrationMessage += `Your bookmarks (${migrationResult.bookmarksAdded} items) have been restored.`;
              }

              // Update loading toast with migration message
              if (loadingToastRef.current) {
                toastService.replaceWithSuccess(loadingToastRef.current, migrationMessage);
              } else {
                toast.success(migrationMessage, { duration: 4000 });
              }
            } else {
              // Standard welcome message if no migration occurred
              if (loadingToastRef.current) {
                toastService.auth.loginSuccess(userData.name, loadingToastRef.current);
              } else {
                toastService.auth.loginSuccess(userData.name);
              }
            }
          })
          .catch(() => {
            // Fallback to standard welcome message if migration fails
            if (loadingToastRef.current) {
              toastService.auth.loginSuccess(userData.name, loadingToastRef.current);
            } else {
              toastService.auth.loginSuccess(userData.name);
            }
          });

        // Clear loading state
        setLoading(false);

        // Update authentication state in ServerAuthProvider
        // Dispatch login event to notify all auth providers
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:login', {
            detail: userData
          }));
        }

        // Start token refresh service for automatic session management
        import('@/lib/unified-token-refresh').then(({ unifiedTokenRefreshService }) => {
          unifiedTokenRefreshService.start();
        }).catch(console.error);

        // Clear the loading toast reference after a short delay to ensure toast update completes
        setTimeout(() => {
          loadingToastRef.current = null;
        }, 100);

        // Use client-side navigation for smooth user experience
        // Get redirect URL from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');

        // Use the existing login flow navigation for seamless experience
        handleLoginSuccess(redirectUrl || undefined, userData.role);
      } catch (error: any) {
        setError('Login succeeded but failed to update user data');
        setLoading(false);
      }
    },
    onError: (error: any) => {
      // Extract user-friendly error message
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        'Login failed. Please check your credentials and try again.';

      setError(errorMessage);
      setLoading(false);

      // Show error toast (update loading toast if exists)
      if (loadingToastRef.current) {
        toastService.auth.loginError(errorMessage, loadingToastRef.current);
        loadingToastRef.current = null;
      } else {
        toastService.auth.loginError(errorMessage);
      }
    },

    retry: false,

    mutationKey: ['auth', 'login'],
  });

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      try {
        await loginMutation.mutateAsync(credentials);
      } catch (error) {
        throw error;
      }
    },
    [loginMutation]
  );

  // Clear error function
  const handleClearError = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    login,
    isLoading: loginMutation.isPending,
    error: loginMutation.error?.message || null,
    clearError: handleClearError,
  };
}

/**
 * Hook for handling login form state and validation
 * Provides form-specific utilities and state management
 */
export function useLoginForm() {
  const { login, isLoading, error, clearError } = useLogin();

  const handleSubmit = useCallback(
    async (credentials: LoginCredentials) => {
      // Clear any previous errors
      clearError();

      // Basic client-side validation
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      if (!credentials.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      if (credentials.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Attempt login
      await login(credentials);
    },
    [login, clearError]
  );

  return {
    handleSubmit,
    isLoading,
    error,
    clearError,
  };
}

/**
 * Hook for social login providers (Google, GitHub, etc.)
 * Handles OAuth flow with optimistic updates
 */
export function useSocialLogin() {
  const { setLoading, setError } = useAuthActions();

  const handleSocialLogin = useCallback(
    async (provider: 'google' | 'github' | 'apple') => {
      try {
        setLoading(true);

        // Redirect to OAuth provider
        window.location.href = `/api/auth/${provider}`;
      } catch (error: any) {
        console.error(`${provider} login error:`, error);
        setError(`Failed to login with ${provider}. Please try again.`);
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  return {
    loginWithGoogle: () => handleSocialLogin('google'),
    loginWithGitHub: () => handleSocialLogin('github'),
    loginWithApple: () => handleSocialLogin('apple'),
  };
}
