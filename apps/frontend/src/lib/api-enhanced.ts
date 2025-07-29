// Enhanced API client for OTP operations with comprehensive error handling

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errorCode?: string;
}

interface OTPSendResponse {
  message: string;
  cooldownRemaining?: number;
}

interface OTPVerifyResponse {
  message: string;
  remainingAttempts?: number;
}

interface OTPError {
  message: string;
  errorCode?: string;
  remainingAttempts?: number;
  cooldownRemaining?: number;
}

class EnhancedOTPError extends Error {
  public errorCode?: string;
  public remainingAttempts?: number;
  public cooldownRemaining?: number;
  public statusCode?: number;

  constructor(
    message: string,
    options?: {
      errorCode?: string;
      remainingAttempts?: number;
      cooldownRemaining?: number;
      statusCode?: number;
    }
  ) {
    super(message);
    this.name = 'EnhancedOTPError';
    this.errorCode = options?.errorCode;
    this.remainingAttempts = options?.remainingAttempts;
    this.cooldownRemaining = options?.cooldownRemaining;
    this.statusCode = options?.statusCode;
  }
}

// Enhanced API client class
export class EnhancedOTPAPI {
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new EnhancedOTPError(data.error || data.message || 'Request failed', {
          errorCode: data.errorCode,
          remainingAttempts: data.remainingAttempts,
          cooldownRemaining: data.cooldownRemaining,
          statusCode: response.status,
        });
      }

      return data;
    } catch (error) {
      if (error instanceof EnhancedOTPError) {
        throw error;
      }

      // Network or other errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new EnhancedOTPError('Network error. Please check your connection.', {
          errorCode: 'NETWORK_ERROR',
        });
      }

      throw new EnhancedOTPError('An unexpected error occurred.', {
        errorCode: 'INTERNAL_ERROR',
      });
    }
  }

  // Send OTP with enhanced rate limiting
  async sendOTP(email: string): Promise<OTPSendResponse> {
    const response = await this.makeRequest<APIResponse<OTPSendResponse>>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return response.data || { message: response.message || 'OTP sent successfully' };
  }

  // Verify OTP with enhanced error handling
  async verifyOTP(email: string, otp: string): Promise<OTPVerifyResponse> {
    const response = await this.makeRequest<APIResponse<OTPVerifyResponse>>(
      '/api/auth/verify-otp-enhanced',
      {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      }
    );

    return response.data || { message: response.message || 'OTP verified successfully' };
  }

  // Get OTP cooldown status
  async getCooldownStatus(
    email: string
  ): Promise<{ cooldownRemaining: number; canResend: boolean }> {
    const response = await this.makeRequest<
      APIResponse<{ cooldownRemaining: number; canResend: boolean }>
    >(`/api/auth/cooldown-status?email=${encodeURIComponent(email)}`, {
      method: 'GET',
    });

    return response.data || { cooldownRemaining: 0, canResend: true };
  }

  // Resend OTP (fallback to existing endpoint)
  async resendOTP(email: string): Promise<OTPSendResponse> {
    const response = await this.makeRequest<APIResponse<OTPSendResponse>>(
      '/api/auth/resend-verification',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    );

    return response.data || { message: response.message || 'OTP resent successfully' };
  }
}

// Singleton instance
export const enhancedOTPAPI = new EnhancedOTPAPI();

// Enhanced hook for OTP operations
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useEnhancedOTP() {
  const queryClient = useQueryClient();

  // Send OTP mutation
  const sendOTPMutation = useMutation({
    mutationFn: (email: string) => enhancedOTPAPI.sendOTP(email),
    onSuccess: data => {
      toast.success(data.message);
      // Invalidate cooldown status
      queryClient.invalidateQueries({ queryKey: ['otp-cooldown'] });
    },
    onError: (error: EnhancedOTPError) => {
      toast.error(error.message);
    },
  });

  // Verify OTP mutation
  const verifyOTPMutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      enhancedOTPAPI.verifyOTP(email, otp),
    onSuccess: data => {
      toast.success(data.message);
      // Clear all OTP-related cache
      queryClient.invalidateQueries({ queryKey: ['otp-cooldown'] });
    },
    onError: (error: EnhancedOTPError) => {
      // Don't show toast here, let component handle it
      console.error('OTP verification failed:', error);
    },
  });

  // Resend OTP mutation
  const resendOTPMutation = useMutation({
    mutationFn: (email: string) => enhancedOTPAPI.resendOTP(email),
    onSuccess: data => {
      toast.success(data.message);
      // Invalidate cooldown status
      queryClient.invalidateQueries({ queryKey: ['otp-cooldown'] });
    },
    onError: (error: EnhancedOTPError) => {
      toast.error(error.message);
    },
  });

  return {
    sendOTP: sendOTPMutation.mutateAsync,
    verifyOTP: verifyOTPMutation.mutateAsync,
    resendOTP: resendOTPMutation.mutateAsync,
    isSending: sendOTPMutation.isPending,
    isVerifying: verifyOTPMutation.isPending,
    isResending: resendOTPMutation.isPending,
  };
}

// DEPRECATED: Enhanced cooldown status hook - Use useOptimizedCooldown instead
export function useEnhancedCooldownStatus(email: string | null) {
  console.warn('useEnhancedCooldownStatus is deprecated. Use useOptimizedCooldown from use-optimized-cooldown.ts instead.');

  return useQuery({
    queryKey: ['cooldown-status-enhanced-deprecated', email], // Different key to avoid conflicts
    queryFn: () => (email ? enhancedOTPAPI.getCooldownStatus(email) : null),
    enabled: false, // DISABLED to prevent duplicate polling
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

      // Intelligent polling intervals
      if (data.cooldownRemaining <= 10) return 1000; // Last 10 seconds: every second
      if (data.cooldownRemaining <= 30) return 2000; // Last 30 seconds: every 2 seconds
      if (data.cooldownRemaining <= 60) return 5000; // Last minute: every 5 seconds
      return 10000; // Longer cooldowns: every 10 seconds
    },
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry on client errors
      if (error?.statusCode >= 400 && error?.statusCode < 500) {
        return false;
      }
      return failureCount < 2; // Reduced retry attempts
    },
  });
}

// Error handling utilities
export function getOTPErrorMessage(error: unknown): string {
  if (error instanceof EnhancedOTPError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

export function isRateLimitError(error: unknown): boolean {
  return (
    error instanceof EnhancedOTPError &&
    (error.errorCode === 'OTP_RATE_LIMIT' || error.statusCode === 429)
  );
}

export function isValidationError(error: unknown): boolean {
  return (
    error instanceof EnhancedOTPError &&
    (error.errorCode === 'OTP_INVALID' || error.statusCode === 400)
  );
}

export { EnhancedOTPError };
