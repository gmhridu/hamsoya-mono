'use client';

import { EnhancedOTPAPI, EnhancedOTPError } from '@/lib/api-enhanced';
import { getRetryStrategy, logError } from '@/lib/error-constants';
import { OTPToast } from '@/lib/toast-utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

// Enhanced OTP hook with comprehensive error handling and retry logic
export function useEnhancedOTP(email?: string) {
  const queryClient = useQueryClient();
  const [retryCount, setRetryCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockExpiry, setLockExpiry] = useState<Date | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize API client
  const otpAPI = new EnhancedOTPAPI();

  // Clear retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Check if account is locked
  const checkLockStatus = useCallback(() => {
    if (lockExpiry && new Date() < lockExpiry) {
      return true;
    }
    if (lockExpiry && new Date() >= lockExpiry) {
      setIsLocked(false);
      setLockExpiry(null);
    }
    return false;
  }, [lockExpiry]);

  // Handle errors with enhanced logic
  const handleError = useCallback(
    (error: EnhancedOTPError, context: string) => {
      logError(error, {
        component: 'useEnhancedOTP',
        action: context,
        email,
      });

      // Handle account locking
      if (error.errorCode === 'OTP_MAX_ATTEMPTS') {
        setIsLocked(true);
        setLockExpiry(new Date(Date.now() + 15 * 60 * 1000)); // 15 minutes
        OTPToast.accountLocked(15);
        return;
      }

      // Handle rate limiting
      if (error.errorCode === 'OTP_RATE_LIMIT') {
        const cooldownSeconds = error.cooldownRemaining || 3600; // 1 hour default
        OTPToast.rateLimited(cooldownSeconds);
        return;
      }

      // Handle network errors with retry
      if (error.errorCode === 'NETWORK_ERROR') {
        const strategy = getRetryStrategy('NETWORK_ERROR');
        if (retryCount < strategy.maxAttempts) {
          OTPToast.networkError(() => {
            setRetryCount(prev => prev + 1);
            // Retry logic will be handled by the calling function
          });
        } else {
          OTPToast.networkError();
        }
        return;
      }

      // Default error handling
      OTPToast.otpFailed(error);
    },
    [email, retryCount]
  );

  // Send OTP mutation
  const sendOTPMutation = useMutation({
    mutationFn: async (targetEmail: string) => {
      if (checkLockStatus()) {
        throw new EnhancedOTPError('Account is temporarily locked', {
          errorCode: 'OTP_MAX_ATTEMPTS',
        });
      }

      return await otpAPI.sendOTP(targetEmail);
    },
    onSuccess: (data, targetEmail) => {
      setRetryCount(0); // Reset retry count on success
      OTPToast.otpSent(targetEmail, data.cooldownRemaining);

      // Invalidate cooldown status
      queryClient.invalidateQueries({
        queryKey: ['otp-cooldown', targetEmail],
      });
    },
    onError: (error: EnhancedOTPError) => {
      handleError(error, 'sendOTP');
    },
  });

  // Verify OTP mutation
  const verifyOTPMutation = useMutation({
    mutationFn: async ({ targetEmail, otp }: { targetEmail: string; otp: string }) => {
      if (checkLockStatus()) {
        throw new EnhancedOTPError('Account is temporarily locked', {
          errorCode: 'OTP_MAX_ATTEMPTS',
        });
      }

      return await otpAPI.verifyOTP(targetEmail, otp);
    },
    onSuccess: data => {
      setRetryCount(0); // Reset retry count on success
      setIsLocked(false); // Clear lock status
      setLockExpiry(null);

      OTPToast.otpVerified();

      // Clear all OTP-related cache
      queryClient.invalidateQueries({
        queryKey: ['otp-cooldown'],
      });
    },
    onError: (error: EnhancedOTPError) => {
      handleError(error, 'verifyOTP');
    },
  });

  // Resend OTP mutation
  const resendOTPMutation = useMutation({
    mutationFn: async (targetEmail: string) => {
      if (checkLockStatus()) {
        throw new EnhancedOTPError('Account is temporarily locked', {
          errorCode: 'OTP_MAX_ATTEMPTS',
        });
      }

      return await otpAPI.resendOTP(targetEmail);
    },
    onSuccess: (data, targetEmail) => {
      setRetryCount(0); // Reset retry count on success
      OTPToast.otpSent(targetEmail, data.cooldownRemaining);

      // Invalidate cooldown status
      queryClient.invalidateQueries({
        queryKey: ['otp-cooldown', targetEmail],
      });
    },
    onError: (error: EnhancedOTPError) => {
      handleError(error, 'resendOTP');
    },
  });

  // Cooldown status query (optimized)
  const cooldownQuery = useQuery({
    queryKey: ['cooldown-status', email], // Use consistent key
    queryFn: () => (email ? otpAPI.getCooldownStatus(email) : null),
    enabled: !!email,
    staleTime: 2000, // Consider data fresh for 2 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchInterval: data => {
      // Stop polling when no cooldown
      if (!data?.cooldownRemaining || data.cooldownRemaining <= 0) {
        return false;
      }

      // Intelligent polling intervals
      if (data.cooldownRemaining <= 10) return 1000; // Last 10 seconds: every second
      if (data.cooldownRemaining <= 30) return 2000; // Last 30 seconds: every 2 seconds
      if (data.cooldownRemaining <= 60) return 5000; // Last minute: every 5 seconds
      return 10000; // Longer cooldowns: every 10 seconds
    },
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (error instanceof EnhancedOTPError && error.statusCode && error.statusCode < 500) {
        return false;
      }
      return failureCount < 2; // Reduced retry attempts
    },
  });

  // Enhanced send OTP with retry logic
  const sendOTP = useCallback(
    async (targetEmail: string) => {
      try {
        await sendOTPMutation.mutateAsync(targetEmail);
      } catch (error) {
        if (error instanceof EnhancedOTPError && error.errorCode === 'NETWORK_ERROR') {
          const strategy = getRetryStrategy('NETWORK_ERROR');
          if (retryCount < strategy.maxAttempts) {
            retryTimeoutRef.current = setTimeout(() => {
              sendOTP(targetEmail);
            }, strategy.delay);
          }
        }
        throw error;
      }
    },
    [sendOTPMutation, retryCount]
  );

  // Enhanced verify OTP with retry logic
  const verifyOTP = useCallback(
    async (targetEmail: string, otp: string) => {
      try {
        await verifyOTPMutation.mutateAsync({ targetEmail, otp });
      } catch (error) {
        if (error instanceof EnhancedOTPError && error.errorCode === 'NETWORK_ERROR') {
          const strategy = getRetryStrategy('NETWORK_ERROR');
          if (retryCount < strategy.maxAttempts) {
            retryTimeoutRef.current = setTimeout(() => {
              verifyOTP(targetEmail, otp);
            }, strategy.delay);
          }
        }
        throw error;
      }
    },
    [verifyOTPMutation, retryCount]
  );

  // Enhanced resend OTP with retry logic
  const resendOTP = useCallback(
    async (targetEmail: string) => {
      try {
        await resendOTPMutation.mutateAsync(targetEmail);
      } catch (error) {
        if (error instanceof EnhancedOTPError && error.errorCode === 'NETWORK_ERROR') {
          const strategy = getRetryStrategy('NETWORK_ERROR');
          if (retryCount < strategy.maxAttempts) {
            retryTimeoutRef.current = setTimeout(() => {
              resendOTP(targetEmail);
            }, strategy.delay);
          }
        }
        throw error;
      }
    },
    [resendOTPMutation, retryCount]
  );

  // Check if can send OTP
  const canSendOTP = useCallback(() => {
    if (isLocked || checkLockStatus()) {
      return false;
    }

    const cooldownData = cooldownQuery.data;
    return !cooldownData?.cooldownRemaining || cooldownData.cooldownRemaining === 0;
  }, [isLocked, checkLockStatus, cooldownQuery.data]);

  // Get remaining cooldown time
  const getCooldownRemaining = useCallback(() => {
    return cooldownQuery.data?.cooldownRemaining || 0;
  }, [cooldownQuery.data]);

  // Get lock status
  const getLockStatus = useCallback(() => {
    return {
      isLocked: isLocked || checkLockStatus(),
      lockExpiry,
      remainingTime: lockExpiry ? Math.max(0, lockExpiry.getTime() - Date.now()) : 0,
    };
  }, [isLocked, checkLockStatus, lockExpiry]);

  return {
    // Actions
    sendOTP,
    verifyOTP,
    resendOTP,

    // Status
    isSending: sendOTPMutation.isPending,
    isVerifying: verifyOTPMutation.isPending,
    isResending: resendOTPMutation.isPending,
    isLoading:
      sendOTPMutation.isPending || verifyOTPMutation.isPending || resendOTPMutation.isPending,

    // Cooldown
    canSendOTP: canSendOTP(),
    cooldownRemaining: getCooldownRemaining(),
    cooldownData: cooldownQuery.data,

    // Lock status
    lockStatus: getLockStatus(),

    // Error handling
    retryCount,

    // Query status
    isCooldownLoading: cooldownQuery.isLoading,
    cooldownError: cooldownQuery.error,
  };
}
