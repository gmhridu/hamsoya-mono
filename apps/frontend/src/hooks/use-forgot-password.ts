'use client';

import { apiClient } from '@/lib/api-client';
import { getUserFriendlyMessage } from '@/lib/error-messages';
import { toastService } from '@/lib/toast-service';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';

// Hook for sending forgot password OTP
export function useForgotPassword() {
  const router = useRouter();
  const loadingToastRef = useRef<string | number | null>(null);

  const mutation = useMutation({
    mutationFn: async (email: string) => {
      return apiClient.forgotPassword(email);
    },
    onMutate: async () => {
      // Show loading toast
      loadingToastRef.current = toastService.auth.sendingOTP();
    },
    onSuccess: (response, email) => {
      // Dismiss loading toast
      if (loadingToastRef.current) {
        toastService.dismiss(loadingToastRef.current);
        loadingToastRef.current = null;
      }

      // Show success toast
      toastService.auth.otpSent();

      // Use replace for instant navigation without flickering
      router.replace(`/forgot-password/verify?email=${encodeURIComponent(email)}`);
    },
    onError: (error: any) => {
      // Dismiss loading toast
      if (loadingToastRef.current) {
        toastService.dismiss(loadingToastRef.current);
        loadingToastRef.current = null;
      }

      // Show error toast and DO NOT navigate for validation errors
      const message = getUserFriendlyMessage(error);
      toastService.auth.error(message);

      // Do not navigate to verify page for email validation errors
      // User stays on forgot password form to correct the email
    },
  });

  return {
    sendOTP: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// Hook for verifying forgot password OTP
export function useVerifyForgotPasswordOTP() {
  const loadingToastRef = useRef<string | number | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      return apiClient.verifyForgotPasswordOTP(email, otp);
    },
    onMutate: async () => {
      // Show loading toast
      loadingToastRef.current = toastService.auth.verifyingOTP();
    },
    onSuccess: (response) => {
      // Dismiss loading toast
      if (loadingToastRef.current) {
        toastService.dismiss(loadingToastRef.current);
        loadingToastRef.current = null;
      }

      // Show success toast
      toastService.auth.otpVerified();

      // DO NOT navigate here - let the component handle navigation
      // This prevents duplicate navigation and race conditions
    },
    onError: (error: any) => {
      // Dismiss loading toast
      if (loadingToastRef.current) {
        toastService.dismiss(loadingToastRef.current);
        loadingToastRef.current = null;
      }

      // DO NOT show toast here - let the component handle error display
      // This prevents multiple toast notifications
      // Error will be available via mutation.error for component to handle
    },
  });

  return {
    verifyOTP: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// Hook for resending forgot password OTP
export function useResendForgotPasswordOTP() {
  const loadingToastRef = useRef<string | number | null>(null);

  const mutation = useMutation({
    mutationFn: async (email: string) => {
      return apiClient.forgotPassword(email);
    },
    onMutate: async () => {
      // Show loading toast
      loadingToastRef.current = toastService.auth.sendingOTP();
    },
    onSuccess: () => {
      // Dismiss loading toast
      if (loadingToastRef.current) {
        toastService.dismiss(loadingToastRef.current);
        loadingToastRef.current = null;
      }

      // Show success toast
      toastService.auth.otpSent();
    },
    onError: (error: any) => {
      // Dismiss loading toast
      if (loadingToastRef.current) {
        toastService.dismiss(loadingToastRef.current);
        loadingToastRef.current = null;
      }

      // Show error toast
      const message = getUserFriendlyMessage(error);
      toastService.auth.error(message);
    },
  });

  return {
    resendOTP: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}

// Hook for resetting password
export function useResetPassword() {
  const router = useRouter();
  const loadingToastRef = useRef<string | number | null>(null);

  const mutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return apiClient.resetPassword(email, password);
    },
    onMutate: async () => {
      // Show loading toast
      loadingToastRef.current = toastService.auth.resettingPassword();
    },
    onSuccess: () => {
      // Dismiss loading toast
      if (loadingToastRef.current) {
        toastService.dismiss(loadingToastRef.current);
        loadingToastRef.current = null;
      }

      // Show success toast
      toastService.auth.passwordReset();

      // Use replace for instant navigation without flickering
      router.replace('/login');
    },
    onError: (error: any) => {
      // Dismiss loading toast
      if (loadingToastRef.current) {
        toastService.dismiss(loadingToastRef.current);
        loadingToastRef.current = null;
      }

      // Show error toast
      const message = getUserFriendlyMessage(error);
      toastService.auth.error(message);
    },
  });

  return {
    resetPassword: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
