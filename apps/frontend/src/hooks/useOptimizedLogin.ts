/**
 * Optimized Login Hook with Server-Side Role-Based Redirects
 * Eliminates client-side redirect delays by leveraging JWT token data
 * Provides instant navigation without content flashing
 */

'use client';

import { apiClient } from '@/lib/api-client';
import { migrateGuestDataToUser } from '@/lib/guest-data-migration';
import { toastService } from '@/lib/toast-service';
import { useAuthActions } from '@/store/auth-store';
import type { LoginCredentials, UseLoginReturn, User } from '@/types/auth';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

// Enhanced API response with server-side redirect information
interface OptimizedLoginApiResponse {
  success: boolean;
  data: {
    user: User;
    message: string;
  };
  redirectUrl: string;
  userRole: string;
  immediateRedirect: boolean;
  message?: string;
  timestamp: string;
}

/**
 * Optimized login hook with server-side role-based redirects
 * Eliminates client-side redirect logic and content flashing
 */
export function useOptimizedLogin(): UseLoginReturn {
  const { setUser, setLoading, setError, clearError } = useAuthActions();
  const loadingToastRef = useRef<string | number | null>(null);

  // TanStack Query mutation with server-side redirect optimization
  const loginMutation = useMutation<OptimizedLoginApiResponse, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      return apiClient.login(credentials.email, credentials.password) as Promise<OptimizedLoginApiResponse>;
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
        setLoading(false);

        // Clear loading toast and show success
        if (loadingToastRef.current) {
          toastService.auth.loginSuccess(userData.name || userData.email, loadingToastRef.current);
          loadingToastRef.current = null;
        } else {
          toastService.auth.loginSuccess(userData.name || userData.email);
        }

        // Migrate guest data to user account in background
        migrateGuestDataToUser().catch(error => {
          console.warn('Guest data migration failed:', error);
        });

        // OPTIMIZATION: Use window.location.replace for instant navigation
        if (response.immediateRedirect && response.redirectUrl) {
          console.log(`[OPTIMIZED-LOGIN] Server provided redirect: ${response.userRole} -> ${response.redirectUrl}`);

          // Use window.location.replace for instant navigation without page reload
          window.location.replace(response.redirectUrl);
        } else {
          // Fallback to role-based redirect
          console.log('[OPTIMIZED-LOGIN] Fallback to role-based redirect');

          const redirectUrl = userData.role === 'ADMIN' ? '/admin' : '/';
          window.location.replace(redirectUrl);
        }
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
    mutationKey: ['auth', 'optimized-login'],
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

  return {
    login,
    isLoading: loginMutation.isPending,
    error: loginMutation.error?.message || null,
    clearError: () => loginMutation.reset(),
  };
}

/**
 * Hook for handling optimized login form state and validation
 */
export function useOptimizedLoginForm() {
  const { login, isLoading, error, clearError } = useOptimizedLogin();

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

      // Attempt login with server-side redirect optimization
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
 * Utility function for immediate server-side redirect after login
 * Can be used in login components that want to leverage server-side redirects
 */
export async function performOptimizedLogin(credentials: LoginCredentials): Promise<void> {
  try {
    const response = await apiClient.login(credentials.email, credentials.password) as OptimizedLoginApiResponse;

    // Use server action for redirect
    const { redirectAfterLogin } = await import('@/lib/server-navigation');
    await redirectAfterLogin(response.redirectUrl);
  } catch (error) {
    console.error('[OPTIMIZED-LOGIN] Error:', error);
    throw error;
  }
}
