'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth, useCooldownStatus } from '@/hooks/use-auth';
import { BRAND_NAME } from '@/lib/constants';
import { useAuthStore } from '@/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle, Loader, Mail, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const verifyEmailSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

export function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [isPending, startTransition] = useTransition();
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [hasResent, setHasResent] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const { isAuthenticated } = useAuthStore();
  const { verifyEmail, resendVerification, isLoading } = useAuth();
  const { data: cooldownData } = useCooldownStatus(isVerified ? null : email); // Stop polling when verified

  // Initialize cooldown from server data
  useEffect(() => {
    if (cooldownData?.cooldownRemaining && cooldownData.cooldownRemaining > 0) {
      setResendCooldown(cooldownData.cooldownRemaining);
    }
  }, [cooldownData]);

  // Redirect if already authenticated or no email provided
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
      return;
    }

    if (!email) {
      toast.error('Email address is required for verification');
      router.push('/login');
      return;
    }
  }, [isAuthenticated, email, router]);

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: '',
    },
  });

  const onSubmit = async (data: VerifyEmailFormData) => {
    if (!email) return;

    setOtpError(null); // Clear previous errors

    startTransition(async () => {
      try {
        await verifyEmail({ email, otp: data.otp });
        setIsVerified(true);

        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/login?message=verified');
        }, 2000);
      } catch (error: any) {
        // Set OTP-specific error for display
        const errorMessage = error?.message || 'Invalid verification code. Please try again.';
        setOtpError(errorMessage);
        form.reset();
      }
    });
  };

  const handleResendOTP = async () => {
    if (!email || resendCooldown > 0) return;

    try {
      await resendVerification({ email });
      setHasResent(true);
      setResendCooldown(60); // 60 seconds cooldown after resend
      toast.success('Verification code sent to your email');
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  // Don't render if no email or already authenticated
  if (!email || isAuthenticated) {
    return null;
  }

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
                <h1 className="text-3xl font-bold text-gray-900 font-serif">Email Verified!</h1>
                <p className="text-gray-600 text-base">
                  Welcome to {BRAND_NAME}! Your account has been successfully verified.
                </p>
              </div>
            </div>

            {/* Success Card */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">
                      🎉 Your account is now active and ready to use!
                    </p>
                  </div>

                  <p className="text-gray-600">
                    You can now sign in to your account and start exploring our premium organic food
                    products.
                  </p>
                </div>

                <Button
                  asChild
                  className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
                >
                  <Link href="/login">Continue to Sign In</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Footer */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">Welcome to the {BRAND_NAME} family! 🌱</p>
            </div>
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
              <Mail className="w-8 h-8 text-primary dark:text-primary" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground font-serif">Verify Your Email</h1>
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

                {/* OTP Input */}
                <div className="space-y-4">
                  <div className="text-center">
                    <label className="text-foreground font-medium text-sm block mb-3">
                      Enter Verification Code
                    </label>
                  </div>

                  <div className="flex justify-center py-2">
                    <InputOTP
                      maxLength={6}
                      value={form.watch('otp')}
                      onChange={value => {
                        form.setValue('otp', value);
                        setOtpError(null); // Clear error when user types
                      }}
                      disabled={isPending || isLoading}
                      containerClassName="gap-2"
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

                  {/* OTP Error Display */}
                  {otpError && (
                    <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <div className="flex items-center gap-2 text-destructive">
                        <div className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center">
                          <span className="text-xs font-bold">!</span>
                        </div>
                        <p className="text-sm font-medium">{otpError}</p>
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
                      disabled={isLoading}
                      className="text-primary hover:text-primary/80 hover:bg-primary/5 dark:hover:bg-primary/10 font-medium transition-all duration-200 h-8 px-3 text-sm"
                    >
                      <RefreshCw className="w-3 h-3 mr-1.5" />
                      {hasResent ? 'Resend Again' : 'Resend Code'}
                    </Button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-1">
                  <Button
                    type="submit"
                    className="w-full h-11 text-base bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg hover:shadow-xl transition-all duration-200 text-primary-foreground font-semibold"
                    disabled={isPending || isLoading || form.watch('otp').length !== 6}
                  >
                    {isPending || isLoading ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Continue'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.push('/login')}
                    disabled={isPending || isLoading}
                    className="w-full h-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 font-medium transition-all duration-200 group text-sm"
                  >
                    <ArrowLeft className="w-3 h-3 mr-1.5 group-hover:-translate-x-1 transition-transform duration-200" />
                    Back to Registration
                  </Button>
                </div>
              </form>
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
