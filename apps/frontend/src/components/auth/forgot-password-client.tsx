'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForgotPassword } from '@/hooks/use-forgot-password';
import { ForgotPasswordEmailSchema, type ForgotPasswordEmailData } from '@/lib/forgot-password-schemas';
import { BRAND_NAME } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader, Mail } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

export function ForgotPasswordClient() {
  const { sendOTP, isLoading, error } = useForgotPassword();

  // Form setup
  const form = useForm<ForgotPasswordEmailData>({
    resolver: zodResolver(ForgotPasswordEmailSchema),
    defaultValues: {
      email: '',
    },
  });

  // Handle form submission
  const onSubmit = (data: ForgotPasswordEmailData) => {
    sendOTP(data.email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-accent" />
            <span className="font-serif text-2xl font-bold text-primary">{BRAND_NAME}</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
          <p className="text-muted-foreground mt-2">
            Enter your email address and we'll send you a verification code to reset your password
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="pl-10 h-11 transition-colors focus:ring-2 focus:ring-primary/20"
                    {...form.register('email')}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
                {/* Display API error for unregistered emails */}
                {error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <div className="w-4 h-4 rounded-full bg-red-200 flex items-center justify-center">
                        <span className="text-xs font-bold">!</span>
                      </div>
                      <p className="text-sm font-medium">
                        {error.message || 'This email address is not registered. Please check your email or create a new account.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Verification Code
                  </>
                )}
              </Button>
            </form>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
