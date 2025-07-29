'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Progress } from '@/components/ui/progress';
import { useAuth, useCooldownStatus } from '@/hooks/use-auth';
import { BRAND_NAME } from '@/lib/constants';
import { useAuthStore } from '@/store';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Loader,
  Mail,
  RefreshCw,
  Shield,
  Timer,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Enhanced OTP error messages mapping with actionable guidance
const OTP_ERROR_MESSAGES = {
  OTP_EXPIRED: {
    message: 'Your verification code has expired. Please request a new one.',
    action: "Click 'Resend Code' to get a fresh verification code.",
    severity: 'warning' as const,
  },
  OTP_INVALID: {
    message: 'Invalid verification code. Please check and try again.',
    action: 'Double-check the 6-digit code from your email and try again.',
    severity: 'error' as const,
  },
  OTP_RATE_LIMIT: {
    message: 'Too many requests. Please wait before requesting again.',
    action: 'Wait for the cooldown period to end, then try requesting a new code.',
    severity: 'warning' as const,
  },
  OTP_MAX_ATTEMPTS: {
    message: 'Too many incorrect attempts. Your account has been temporarily locked.',
    action: 'Please wait for the lock period to expire before trying again.',
    severity: 'error' as const,
  },
  OTP_ALREADY_VERIFIED: {
    message: 'This code has already been used. Please request a new one.',
    action: "Click 'Resend Code' to get a fresh verification code.",
    severity: 'warning' as const,
  },
  OTP_NOT_FOUND: {
    message: 'Verification code not found. Please request a new one.',
    action: "Click 'Resend Code' to get a fresh verification code.",
    severity: 'warning' as const,
  },
  REGISTRATION_EXPIRED: {
    message: 'Your registration session has expired.',
    action: 'Please start the registration process again from the beginning.',
    severity: 'error' as const,
  },
  NETWORK_ERROR: {
    message: 'Connection error. Please check your internet and try again.',
    action: 'Check your internet connection and try again.',
    severity: 'error' as const,
  },
  INTERNAL_ERROR: {
    message: 'Something went wrong on our end. Please try again later.',
    action: 'If the problem persists, please contact our support team.',
    severity: 'error' as const,
  },
  VERIFICATION_FAILED: {
    message: 'Verification failed. Please try again.',
    action: 'Please check your code and try again, or request a new one.',
    severity: 'error' as const,
  },
} as const;

const verifyOTPSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

type VerifyOTPFormData = z.infer<typeof verifyOTPSchema>;

interface EnhancedOTPVerificationProps {
  email?: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

export function EnhancedOTPVerification({
  email: propEmail,
  onSuccess,
  onBack,
}: EnhancedOTPVerificationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = propEmail || searchParams.get('email');

  // Enhanced state management for better error handling
  const [isPending, startTransition] = useTransition();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [otpError, setOtpError] = useState<{
    message: string;
    action: string;
    severity: 'error' | 'warning';
    code?: string;
  } | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockDuration, setLockDuration] = useState<number | null>(null);
  const [isResending, setIsResending] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { verifyEmail, resendVerification, isLoading } = useAuth();
  const { data: cooldownData } = useCooldownStatus(isVerified ? null : email); // Stop polling when verified

  // Form setup
  const form = useForm<VerifyOTPFormData>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Initialize cooldown from server data
  useEffect(() => {
    if (cooldownData?.data?.cooldownRemaining && cooldownData.data.cooldownRemaining > 0) {
      setResendCooldown(cooldownData.data.cooldownRemaining);
    }
  }, [cooldownData]);

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // Redirect if already authenticated or no email
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
      return;
    }

    if (!email) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, email, router]);

  // Cleanup effect to stop polling when verification is complete
  useEffect(() => {
    if (isVerified) {
      // Clear any ongoing timers and stop polling
      setResendCooldown(0);
      setOtpError(null);
    }
  }, [isVerified]);

  // Enhanced error handling with structured error information
  const handleError = useCallback((error: any) => {
    console.error('OTP verification error:', error);

    let errorCode = 'VERIFICATION_FAILED';
    let errorInfo = OTP_ERROR_MESSAGES.VERIFICATION_FAILED;

    // Reset previous error state
    setRemainingAttempts(null);
    setLockDuration(null);

    // Check for structured error response from backend
    if (error?.response?.data) {
      const errorData = error.response.data;

      if (errorData.errorCode) {
        errorCode = errorData.errorCode;
        errorInfo =
          OTP_ERROR_MESSAGES[errorCode as keyof typeof OTP_ERROR_MESSAGES] ||
          OTP_ERROR_MESSAGES.VERIFICATION_FAILED;
      }

      // Extract structured error data
      if (errorData.remainingAttempts !== undefined) {
        setRemainingAttempts(errorData.remainingAttempts);
      }

      if (errorData.lockDuration !== undefined) {
        setLockDuration(errorData.lockDuration);
      }

      // Use backend's user-friendly message if available
      if (errorData.userFriendlyMessage) {
        errorInfo = {
          ...errorInfo,
          message: errorData.userFriendlyMessage,
        };
      }
    } else if (error?.message) {
      // Fallback: Parse error message for specific cases (legacy support)
      if (error.message.includes('expired')) {
        errorCode = 'OTP_EXPIRED';
        errorInfo = OTP_ERROR_MESSAGES.OTP_EXPIRED;
      } else if (error.message.includes('Invalid OTP')) {
        errorCode = 'OTP_INVALID';
        errorInfo = OTP_ERROR_MESSAGES.OTP_INVALID;

        // Extract remaining attempts from message
        const attemptsMatch = error.message.match(/(\d+) attempts remaining/);
        if (attemptsMatch) {
          setRemainingAttempts(parseInt(attemptsMatch[1], 10));
        }
      } else if (error.message.includes('Too many')) {
        errorCode = 'OTP_MAX_ATTEMPTS';
        errorInfo = OTP_ERROR_MESSAGES.OTP_MAX_ATTEMPTS;

        // Extract lock duration from message
        const lockMatch = error.message.match(/(\d+) minutes/);
        if (lockMatch) {
          setLockDuration(parseInt(lockMatch[1], 10));
        }
      } else if (error.message.includes('rate limit')) {
        errorCode = 'OTP_RATE_LIMIT';
        errorInfo = OTP_ERROR_MESSAGES.OTP_RATE_LIMIT;
      }
    } else if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
      errorCode = 'NETWORK_ERROR';
      errorInfo = OTP_ERROR_MESSAGES.NETWORK_ERROR;
    }

    // Set error state with enhanced information
    setOtpError({
      message: errorInfo.message,
      action: errorInfo.action,
      severity: errorInfo.severity,
      code: errorCode,
    });

    // Show toast with appropriate severity
    if (errorInfo.severity === 'warning') {
      toast.warning(errorInfo.message);
    } else {
      toast.error(errorInfo.message);
    }
  }, []);

  // OTP submission handler
  const onSubmit = async (data: VerifyOTPFormData) => {
    if (!email) return;

    setOtpError(null);
    setRemainingAttempts(null);

    startTransition(async () => {
      try {
        await verifyEmail({ email, otp: data.otp });
        setIsVerified(true);

        toast.success('Email verified successfully!');

        if (onSuccess) {
          onSuccess();
        } else {
          // Redirect to login after a short delay
          setTimeout(() => {
            router.push('/login?message=verified');
          }, 2000);
        }
      } catch (error: any) {
        handleError(error);
        form.reset();
      }
    });
  };

  // Resend OTP handler
  const handleResendOTP = async () => {
    if (!email || resendCooldown > 0) return;

    setIsResending(true);
    setOtpError(null);

    try {
      await resendVerification({ email });
      setResendCooldown(60); // Start 60-second cooldown
      toast.success('New verification code sent!');
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsResending(false);
    }
  };

  // Auto-advance OTP input with error clearing
  const handleOTPChange = (value: string) => {
    form.setValue('otp', value);

    // Clear errors when user starts typing
    if (otpError && value.length > 0) {
      setOtpError(null);
      setRemainingAttempts(null);
      setLockDuration(null);
    }

    // Auto-submit when 6 digits are entered
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      form.handleSubmit(onSubmit)();
    }
  };

  // Format cooldown time
  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back button */}
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-emerald-600 hover:text-emerald-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}

        {/* Main card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            {/* Logo and brand */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {isVerified ? 'Email Verified!' : 'Verify Your Email'}
              </h1>
              <p className="text-gray-600 text-sm">
                {isVerified
                  ? 'Your account has been successfully verified.'
                  : `We've sent a 6-digit code to ${email}`}
              </p>
            </div>

            {/* Progress indicator */}
            {!isVerified && (
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span>Step 2 of 2: Email Verification</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {isVerified ? (
              // Success state
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
                <p className="text-gray-600">Redirecting you to login...</p>
              </div>
            ) : (
              // OTP input form
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* OTP Input */}
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={form.watch('otp')}
                      onChange={handleOTPChange}
                      disabled={isPending}
                      className={otpError ? 'aria-invalid' : ''}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot
                          index={0}
                          className={
                            otpError ? 'border-red-300 data-[active=true]:border-red-500' : ''
                          }
                        />
                        <InputOTPSlot
                          index={1}
                          className={
                            otpError ? 'border-red-300 data-[active=true]:border-red-500' : ''
                          }
                        />
                        <InputOTPSlot
                          index={2}
                          className={
                            otpError ? 'border-red-300 data-[active=true]:border-red-500' : ''
                          }
                        />
                        <InputOTPSlot
                          index={3}
                          className={
                            otpError ? 'border-red-300 data-[active=true]:border-red-500' : ''
                          }
                        />
                        <InputOTPSlot
                          index={4}
                          className={
                            otpError ? 'border-red-300 data-[active=true]:border-red-500' : ''
                          }
                        />
                        <InputOTPSlot
                          index={5}
                          className={
                            otpError ? 'border-red-300 data-[active=true]:border-red-500' : ''
                          }
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {/* Enhanced error display with actionable guidance */}
                  {otpError && (
                    <div
                      className={`border rounded-lg p-4 flex items-start space-x-3 ${
                        otpError.severity === 'warning'
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <AlertTriangle
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          otpError.severity === 'warning' ? 'text-amber-500' : 'text-red-500'
                        }`}
                      />
                      <div className="space-y-2 flex-1">
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              otpError.severity === 'warning' ? 'text-amber-800' : 'text-red-700'
                            }`}
                          >
                            {otpError.message}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              otpError.severity === 'warning' ? 'text-amber-700' : 'text-red-600'
                            }`}
                          >
                            {otpError.action}
                          </p>
                        </div>

                        {/* Additional error information */}
                        <div className="flex flex-wrap gap-3 text-xs">
                          {remainingAttempts !== null && (
                            <div
                              className={`px-2 py-1 rounded-md ${
                                otpError.severity === 'warning'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {remainingAttempts} attempts remaining
                            </div>
                          )}

                          {lockDuration !== null && (
                            <div className="px-2 py-1 rounded-md bg-red-100 text-red-700">
                              Locked for {lockDuration} minutes
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form validation error */}
                  {form.formState.errors.otp && (
                    <p className="text-red-500 text-sm text-center">
                      {form.formState.errors.otp.message}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                  disabled={isPending || form.watch('otp').length !== 6}
                >
                  {isPending ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </Button>

                {/* Resend section */}
                <div className="text-center space-y-3">
                  <p className="text-gray-600 text-sm">Didn't receive the code?</p>

                  {resendCooldown > 0 ? (
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                      <Timer className="w-4 h-4" />
                      <span>Resend in {formatCooldown(resendCooldown)}</span>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResendOTP}
                      disabled={isResending}
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    >
                      {isResending ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Resend Code
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            )}

            {/* Security notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-amber-800 text-sm">
                  <p className="font-medium">Security Notice</p>
                  <p className="text-xs mt-1">
                    Never share this code with anyone. {BRAND_NAME} will never ask for your
                    verification code.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help link */}
        <div className="text-center">
          <Link
            href="/support"
            className="text-sm text-gray-500 hover:text-emerald-600 transition-colors"
          >
            Need help? Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
