import { apiClient } from '@/lib/api-client';
import { getUserFriendlyMessage } from '@/lib/error-messages';
import { queryClient, queryKeys } from '@/lib/query-client';
import { useAuthActions, useAuthStore } from '@/store/auth-store';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
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
    onSuccess: (data, variables) => {
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

      // Assuming the API returns user data
      if (data.user) {
        login(data.user);
      }

      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });

      toast.success('Login successful!');
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

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      // Clear auth state
      logout();

      // Clear all user-related queries
      queryClient.removeQueries({ queryKey: queryKeys.auth.me });
      queryClient.removeQueries({ queryKey: queryKeys.auth.profile });

      toast.success('Logged out successfully');
      router.push('/');
    },
    onError: (error: any) => {
      // Even if logout fails on server, clear local state
      logout();
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
      const data = response.data || response;
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

// Hook for getting current user
export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => apiClient.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: isAuthenticated, // Only fetch if user is authenticated
    retry: (failureCount, error: any) => {
      // Don't retry if unauthorized
      if (error?.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });

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
