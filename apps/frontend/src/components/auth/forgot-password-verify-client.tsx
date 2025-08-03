'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useVerifyForgotPasswordOTP, useForgotPassword } from '@/hooks/use-auth';
import { BRAND_NAME } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, ArrowLeft, CheckCircle, Loader, RefreshCw, Shield, Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Form schema matching the existing verify-email pattern
const verifyOTPSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type VerifyOTPFormData = z.infer<typeof verifyOTPSchema>;

export function ForgotPasswordVerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [isPending, startTransition] = useTransition();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockDuration, setLockDuration] = useState<number | null>(null);

  const { mutateAsync: verifyOTP, isPending: isVerifying } = useVerifyForgotPasswordOTP();
  const { mutateAsync: resendOTP } = useForgotPassword();

  // Email validation is now handled server-side to prevent flickering

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const form = useForm<VerifyOTPFormData>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Enhanced error handling function
  const handleError = useCallback((error: any) => {
    const errorDetails = error?.details || {};
    const errorCode = errorDetails.errorCode;
    const message = error?.message || 'Invalid verification code. Please try again.';

    // Extract remaining attempts and lock duration from error details
    if (errorDetails.remainingAttempts !== undefined) {
      setRemainingAttempts(errorDetails.remainingAttempts);
    }

    if (errorDetails.lockDuration !== undefined) {
      setLockDuration(errorDetails.lockDuration);
    }

    // Set appropriate error message
    setOtpError(message);

    // Show toast with appropriate severity
    if (errorCode === 'OTP_MAX_ATTEMPTS') {
      toast.error(message);
    } else if (errorCode === 'OTP_INVALID' && errorDetails.remainingAttempts !== undefined) {
      toast.warning(message);
    } else {
      toast.error(message);
    }
  }, []);

  const onSubmit = async (data: VerifyOTPFormData) => {
    if (!email) return;

    setOtpError(null);
    setRemainingAttempts(null);

    startTransition(async () => {
      try {
        await verifyOTP({ email, otp: data.otp });
        setIsVerified(true);

        toast.success('Password reset code verified successfully!');

        // Navigate to reset password page after a short delay
        setTimeout(() => {
          router.replace(`/forgot-password/reset?email=${encodeURIComponent(email)}`);
        }, 2000);
      } catch (error: any) {
        handleError(error);
        form.reset();
        // Stay on verification page to allow user to try again
      }
    });
  };

  const handleResendOTP = async () => {
    if (!email || resendCooldown > 0) return;

    setIsResending(true);
    setOtpError(null);

    try {
      await resendOTP({ email });
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

  // Email is guaranteed to exist due to server-side validation

  // Success state
  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-background via-white to-brand-background/50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]" />

        <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-md">
            {/* Success Header */}
            <div className="text-center space-y-6 mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto shadow-lg border border-green-300">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-900 font-serif">Code Verified!</h1>
                <p className="text-gray-600 text-base">
                  Your verification code has been confirmed. You can now set a new password.
                </p>
              </div>
            </div>

            {/* Success Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">
                      🔒 Redirecting to password reset...
                    </p>
                  </div>

                  <p className="text-gray-600">
                    Please wait while we redirect you to set your new password.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-background via-background to-brand-background/50 dark:from-background dark:via-card dark:to-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(199,159,18,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(199,159,18,0.05),transparent_50%)]" />

      <div className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center space-y-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30 rounded-full flex items-center justify-center mx-auto shadow-lg border border-primary/20 dark:border-primary/30 dark:shadow-2xl">
              <CheckCircle className="w-8 h-8 text-primary dark:text-primary" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground font-serif">Verify Your Code</h1>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">
                  We've sent a 6-digit verification code to
                </p>
                <p className="text-primary font-semibold text-base break-all px-3 py-1.5 bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 dark:border-primary/30">
                  {email}
                </p>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm dark:bg-card/90 dark:shadow-2xl">
            <CardContent className="p-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Error Display */}
                {form.formState.errors.otp && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                    {form.formState.errors.otp.message}
                  </div>
                )}

                {/* Custom OTP Error Display */}
                {otpError && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg text-center">
                    {otpError}
                  </div>
                )}

                {/* OTP Input */}
                <div className="space-y-4">
                  <div className="text-center">
                    <label className="text-foreground font-medium text-sm block mb-3">
                      Enter Verification Code
                    </label>
                  </div>

                  {/* OTP Input - Enhanced with auto-submit */}
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={form.watch('otp')}
                      onChange={handleOTPChange}
                      disabled={isPending}
                      className={otpError ? 'aria-invalid' : ''}
                    >
                      <InputOTPGroup className="gap-2">
                        {[0, 1, 2, 3, 4, 5].map(index => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className={`w-11 h-11 text-lg font-bold border-2 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-background/80 backdrop-blur-sm dark:bg-card/80 dark:border-border dark:hover:border-primary text-foreground ${
                              otpError
                                ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                                : 'border-border'
                            }`}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {/* Enhanced Error Display */}
                  {otpError && (
                    <div className="mt-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {lockDuration ? (
                            <Shield className="w-5 h-5 text-destructive" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-medium text-destructive">{otpError}</p>

                          {/* Remaining attempts indicator */}
                          {remainingAttempts !== null && remainingAttempts > 0 && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Timer className="w-3 h-3" />
                              <span>
                                {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                              </span>
                            </div>
                          )}

                          {/* Lock duration indicator */}
                          {lockDuration && (
                            <div className="flex items-center gap-2 text-xs text-destructive">
                              <Shield className="w-3 h-3" />
                              <span>Account locked for {lockDuration} minutes</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Resend Section */}
                <div className="text-center space-y-2">
                  <p className="text-xs text-muted-foreground">Didn't receive the code?</p>

                  {resendCooldown > 0 ? (
                    <div className="flex items-center justify-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
                      <div className="relative">
                        <div className="w-5 h-5 border-2 border-primary/20 rounded-full"></div>
                        <div className="absolute inset-0 w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          Resend code in{' '}
                          <span className="text-primary font-semibold">{resendCooldown}s</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Please wait before requesting another code
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendOTP}
                      disabled={isResending}
                      className="text-primary hover:text-primary/80 hover:bg-primary/5 dark:hover:bg-primary/10 font-medium transition-all duration-200 h-8 px-3 text-sm"
                    >

                      {isResending ? (
                        <>
                          <Loader className="w-3 h-3 mr-1.5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1.5" />
                          Resend Code
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-1">
                  <Button
                    type="submit"
                    className="w-full h-11 text-base bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-200 text-primary-foreground font-semibold"
                    disabled={isPending || form.watch('otp').length !== 6}
                  >
                    {isPending ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Continue'
                    )}
                  </Button>
                </div>
              </form>

              {/* Back Link */}
              <div className="text-center pt-4">
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to forgot password
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground">
              Need help? Contact us at{' '}
              <a
                href="mailto:support@hamsoya.com"
                className="text-primary hover:text-primary/80 hover:underline transition-colors duration-200"
              >
                support@hamsoya.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
