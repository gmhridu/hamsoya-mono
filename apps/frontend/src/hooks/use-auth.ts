import { apiClient } from '@/lib/api-client';
import { getUserFriendlyMessage } from '@/lib/error-messages';
import { queryClient, queryKeys } from '@/lib/query-client';
import { useAuthActions, useAuthStore } from '@/store/auth-store';
import { AUTH_CONFIG, AUTH_QUERY_KEYS } from '@/types/auth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Hook for user registration
export function useRegister() {
  const router = useRouter();
  const { setLoading, setError, clearError } = useAuthActions();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      role: 'USER' | 'SELLER' | 'ADMIN';
      phone_number?: string;
      profile_image_url?: string;
    }) => {
      setLoading(true);
      clearError();
      return apiClient.register(data);
    },
    onSuccess: (_, variables) => {
      setLoading(false);
      toast.success('Registration successful! Please check your email for verification.');
      // Redirect to OTP verification page with email parameter
      router.push(`/verify-email?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error: any) => {
      setLoading(false);
      const errorMessage =
        getUserFriendlyMessage(error) || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });
}

// Hook for user login
export function useLogin() {
  const router = useRouter();
  const { setLoading, setError, clearError, login } = useAuthActions();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      setLoading(true);
      clearError();
      return apiClient.login(data.email, data.password);
    },
    onSuccess: (data: any) => {
      setLoading(false);

      // Handle the response structure from backend
      let userData = null;
      if (data?.data?.user) {
        userData = data.data.user;
        login(userData);
      } else if (data?.user) {
        userData = data.user;
        login(userData);
      }

      // Update server auth provider state
      if (typeof window !== 'undefined' && userData) {
        window.dispatchEvent(new CustomEvent('auth:login', { detail: userData }));
      }

      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });

      // Note: Toast is handled by the main useLogin hook for better UX
      router.push('/');
    },
    onError: (error: any) => {
      setLoading(false);
      const errorMessage = getUserFriendlyMessage(error) || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });
}

// Hook for user logout
export function useLogout() {
  const router = useRouter();
  const { logout } = useAuthActions();

  const handleLogoutCleanup = () => {
    // Clear auth state
    logout();

    // Clear server auth provider state
    if (typeof window !== 'undefined') {
      // Trigger a custom event to notify ServerAuthProvider
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    // Clear all user-related queries
    queryClient.removeQueries({ queryKey: queryKeys.auth.me });
    queryClient.removeQueries({ queryKey: queryKeys.auth.profile });

    // Clear any other user-related data from query cache
    queryClient.removeQueries({
      predicate: query =>
        query.queryKey.some(
          key =>
            typeof key === 'string' &&
            (key.includes('user') || key.includes('profile') || key.includes('auth'))
        ),
    });

    // Clear localStorage items that might contain user data
    if (typeof window !== 'undefined') {
      // Clear any user-specific localStorage items
      Object.keys(localStorage).forEach(key => {
        if (key.includes('user') || key.includes('auth') || key.includes('token')) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      handleLogoutCleanup();
      toast.success('Logged out successfully');
      router.push('/');
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      handleLogoutCleanup();
      toast.success('Logged out successfully');
      router.push('/');
    },
  });
}

// Hook for email verification
export function useVerifyEmail() {
  const { setLoading, setError, clearError } = useAuthActions();

  return useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      setLoading(true);
      clearError();
      return apiClient.verifyEmail(data.email, data.otp);
    },
    onSuccess: () => {
      setLoading(false);

      // Invalidate user data to refetch updated verification status
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });

      toast.success('Email verified successfully!');
    },
    onError: (error: any) => {
      setLoading(false);
      const errorMessage =
        getUserFriendlyMessage(error) || 'Email verification failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });
}

// Hook for resending verification email
export function useResendVerification() {
  const { setLoading, setError, clearError } = useAuthActions();

  return useMutation({
    mutationFn: async (data: { email: string }) => {
      setLoading(true);
      clearError();
      return apiClient.resendVerification(data.email);
    },
    onSuccess: () => {
      setLoading(false);
      toast.success('Verification email sent! Please check your inbox.');
    },
    onError: (error: any) => {
      setLoading(false);
      const errorMessage =
        getUserFriendlyMessage(error) || 'Failed to send verification email. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });
}

// DEPRECATED: Hook for getting cooldown status - Use useOptimizedCooldown instead
export function useCooldownStatus(email: string | null) {
  console.warn(
    'useCooldownStatus is deprecated. Use useOptimizedCooldown from use-optimized-cooldown.ts instead.'
  );

  return useQuery({
    queryKey: ['cooldown-status-deprecated', email],
    queryFn: async () => {
      if (!email) throw new Error('Email is required');
      const response = await apiClient.getCooldownStatus(email);
      const data = (response as any)?.data || response;
      return {
        cooldownRemaining: data.cooldownRemaining || 0,
        canResend: data.canResend ?? true,
      };
    },
    enabled: false, // DISABLED to prevent duplicate polling - use useOptimizedCooldown instead
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

// Hook for forgot password
export function useForgotPassword() {
  const { setLoading, setError, clearError } = useAuthActions();

  return useMutation({
    mutationFn: async (data: { email: string }) => {
      setLoading(true);
      clearError();
      return apiClient.forgotPassword(data.email);
    },
    onSuccess: () => {
      setLoading(false);
      toast.success('Password reset email sent! Please check your inbox.');
    },
    onError: (error: any) => {
      setLoading(false);
      const errorMessage =
        getUserFriendlyMessage(error) || 'Failed to send password reset email. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });
}

// Hook for resetting password
export function useResetPassword() {
  const router = useRouter();
  const { setLoading, setError, clearError } = useAuthActions();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      setLoading(true);
      clearError();
      return apiClient.resetPassword(data.email, data.password);
    },
    onSuccess: () => {
      setLoading(false);
      toast.success('Password reset successfully! Please login with your new password.');
      router.push('/login');
    },
    onError: (error: any) => {
      setLoading(false);
      const errorMessage =
        getUserFriendlyMessage(error) || 'Password reset failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });
}

// Hook for getting current user with optimized caching
export function useCurrentUser() {
  const { isAuthenticated, user } = useAuthStore();

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me, // Use consistent query key
    queryFn: () => apiClient.getCurrentUser(),
    staleTime: AUTH_CONFIG.staleTime, // 15 minutes - longer than token expiry
    gcTime: AUTH_CONFIG.gcTime, // 2 hours
    enabled: isAuthenticated,
    retry: (failureCount, error: any) => {
      if (error?.statusCode === 401) {
        return false;
      }
      return failureCount < AUTH_CONFIG.retryAttempts;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Prevent refetch on mount if data is fresh
    initialData: user ? { data: user } : undefined, // Use persisted data as initial data
  });
}

// Hook for initializing authentication state on app load
export function useAuthInitialization() {
  const { setUser, setLoading, logout } = useAuthActions();
  const { isAuthenticated } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration issues by only checking tokens after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if we have access token in cookies to determine if we should try to fetch user
  const hasAccessToken =
    isMounted && typeof window !== 'undefined' && document.cookie.includes('accessToken=');

  const {
    data: userData,
    error,
    isLoading,
  } = useQuery({
    queryKey: AUTH_QUERY_KEYS.me, // Use consistent query key
    queryFn: () => apiClient.getCurrentUser(),
    staleTime: AUTH_CONFIG.staleTime, // 15 minutes - longer than token expiry
    gcTime: AUTH_CONFIG.gcTime, // 2 hours
    enabled: hasAccessToken, // Only fetch if we have an access token and are mounted
    retry: (failureCount, error: any) => {
      if (error?.statusCode === 401) {
        return false;
      }
      return failureCount < AUTH_CONFIG.retryAttempts;
    },
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: false, // Prevent automatic refetch on mount
  });

  useEffect(() => {
    // Don't initialize until component is mounted to prevent hydration issues
    if (!isMounted) {
      return;
    }

    // If we have persisted auth state but no access token, clear the auth state
    if (isAuthenticated && !hasAccessToken) {
      logout();
      setIsInitialized(true);
      return;
    }

    // If we have persisted auth and access token, mark as initialized
    if (isAuthenticated && hasAccessToken && !isInitialized) {
      setIsInitialized(true);
      setLoading(false);
      return;
    }

    // If we have fresh user data from API, update store
    if ((userData as any)?.data) {
      setUser((userData as any).data);
      setIsInitialized(true);
      setLoading(false);
      return;
    }

    // If there's an error (like 401), clear auth state
    if (error) {
      if (error.statusCode === 401) {
        logout();
      }
      setIsInitialized(true);
      setLoading(false);
      return;
    }

    // If no access token and not loading, mark as initialized (guest user)
    if (!hasAccessToken && !isLoading) {
      setIsInitialized(true);
      setLoading(false);
      return;
    }

    // If query finished loading (success or error), mark as initialized
    if (!isLoading) {
      setIsInitialized(true);
      setLoading(false);
    }
  }, [
    userData,
    error,
    isLoading,
    isInitialized,
    setUser,
    setLoading,
    logout,
    isAuthenticated,
    hasAccessToken,
    isMounted,
  ]);

  return {
    isInitialized,
    isLoading: !isInitialized && (isLoading || (hasAccessToken && !userData && !error)),
  };
}

// Hook for getting user profile (same as current user for now)
export function useUserProfile() {
  return useCurrentUser();
}

// Hook for updating user profile
export function useUpdateProfile() {
  const { updateProfile } = useAuthActions();

  return useMutation({
    mutationFn: async (data: { name?: string; phone_number?: string }) => {
      // For now, just update local state since we don't have the backend endpoint
      return Promise.resolve(data);
    },
    onSuccess: data => {
      // Update local state
      updateProfile(data);

      // Invalidate user data to refetch updated profile
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.profile });

      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      toast.error(getUserFriendlyMessage(error) || 'Failed to update profile. Please try again.');
    },
  });
}

// Composite hook that combines login and register functionality
export function useAuth() {
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationMutation = useResendVerification();
  const { isLoading } = useAuthStore();

  return {
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    verifyEmail: verifyEmailMutation.mutateAsync,
    resendVerification: resendVerificationMutation.mutateAsync,
    isLoading:
      isLoading ||
      loginMutation.isPending ||
      registerMutation.isPending ||
      verifyEmailMutation.isPending ||
      resendVerificationMutation.isPending,
  };
}
