

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileImageUpload } from '@/components/ui/profile-image-upload';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { serverLoginAction, serverRegisterAction } from '@/lib/server-auth-actions';
import { BRAND_NAME } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader, Lock, Mail, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Form schemas - identical to login-client.tsx
const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const RegisterSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
    phone_number: z.string().optional(),
    profile_image_url: z.string().optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof LoginSchema>;
type RegisterFormData = z.infer<typeof RegisterSchema>;

interface ServerActionLoginFormProps {
  redirectTo?: string;
  error?: string;
}

export function ServerActionLoginForm({ redirectTo, error }: ServerActionLoginFormProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);
  const [profileImageFileId, setProfileImageFileId] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  // Login form setup with React Hook Form and Zod validation
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange', // Real-time validation
  });

  // Register form setup with React Hook Form and Zod validation
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone_number: '',
      profile_image_url: '',
    },
    mode: 'onChange', // Real-time validation
  });

  // Handle login form submission with server actions
  const onLoginSubmit = async (data: LoginFormData) => {
    // Show loading toast
    const loadingToastId = toast.loading('Signing in...', {
      description: 'Please wait while we authenticate you',
    });

    startTransition(async () => {
      try {
        // Use server action for instant server-side redirects
        await serverLoginAction({
          email: data.email,
          password: data.password,
          redirectTo: redirectTo,
        });

        // If we reach here, the server action didn't redirect (unexpected)
        console.warn('[LOGIN] Server action completed without redirect, showing success toast');
        toast.success('Login successful!', { id: loadingToastId });
      } catch (error: any) {
        // NEXT_REDIRECT is expected behavior for server actions - don't treat as error
        if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
          console.log('[LOGIN] Server-side redirect successful');
          toast.success('Login successful! Redirecting...', { id: loadingToastId });
          return; // Redirect is happening
        }

        console.error('Login submission error:', error);
        toast.error('Login failed. Please try again.', { id: loadingToastId });
      }
    });
  };

  // Handle register form submission with server actions
  const onRegisterSubmit = async (data: RegisterFormData) => {
    // Show loading toast
    const loadingToastId = toast.loading('Creating your account...', {
      description: 'Please wait while we set up your profile',
    });

    startTransition(async () => {
      try {
        const { confirmPassword, ...registerData } = data;
        // Use server action for instant server-side redirects
        await serverRegisterAction({
          ...registerData,
          profile_image_url: profileImageUrl,
          redirectTo: undefined,
        });

        // If we reach here, show success message
        toast.success('Registration successful! Please check your email for verification.', {
          id: loadingToastId
        });
        registerForm.reset(); // Reset form after successful submission
        // Reset profile image state
        setProfileImageUrl(undefined);
        setProfileImageFileId(undefined);
      } catch (error: any) {
        // NEXT_REDIRECT is expected behavior for server actions - don't treat as error
        if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
          console.log('[REGISTER] Server-side redirect successful');
          toast.success('Registration successful! Please check your email for verification.', {
            id: loadingToastId
          });
          return; // Redirect is happening
        }

        console.error('Registration submission error:', error);
        toast.error('Registration failed. Please try again.', { id: loadingToastId });
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{BRAND_NAME}</h1>
        <p className="text-muted-foreground">
          Welcome to premium organic food products
        </p>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="pb-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-11">
              <TabsTrigger value="login" className="text-sm font-medium">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="text-sm font-medium">
                Sign Up
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Login Tab */}
            <TabsContent value="login" className="space-y-0">
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium text-foreground">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 h-11 transition-colors focus:ring-2 focus:ring-primary/20"
                      {...loginForm.register('email')}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-11 transition-colors focus:ring-2 focus:ring-primary/20"
                      {...loginForm.register('password')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  size="lg"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register" className="space-y-0">
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-sm font-medium text-foreground">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10 h-11 transition-colors focus:ring-2 focus:ring-primary/20"
                      {...registerForm.register('name')}
                    />
                  </div>
                  {registerForm.formState.errors.name && (
                    <p className="text-sm text-red-500">
                      {registerForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-medium text-foreground">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 h-11 transition-colors focus:ring-2 focus:ring-primary/20"
                      {...registerForm.register('email')}
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-phone" className="text-sm font-medium text-foreground">
                    Phone Number <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      className="pl-10 h-11 transition-colors focus:ring-2 focus:ring-primary/20"
                      {...registerForm.register('phone_number')}
                    />
                  </div>
                </div>

                {/* Profile Image Upload */}
                <div className="space-y-3">
                  <div className="text-center">
                    <Label className="text-sm font-medium text-foreground">
                      Profile Picture <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                  </div>
                  <div className="flex justify-center items-center py-4">
                    <ProfileImageUpload
                      currentImageUrl={profileImageUrl}
                      currentFileId={profileImageFileId}
                      onImageUpload={(url, fileId) => {
                        setProfileImageUrl(url);
                        setProfileImageFileId(fileId);
                        registerForm.setValue('profile_image_url', url);
                      }}
                      onImageRemove={() => {
                        setProfileImageUrl(undefined);
                        setProfileImageFileId(undefined);
                        registerForm.setValue('profile_image_url', '');
                      }}
                      size="lg"
                      preserveOnUnmount={true}
                      isFormSubmitting={isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-medium text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      className="pl-10 pr-10 h-11 transition-colors focus:ring-2 focus:ring-primary/20"
                      {...registerForm.register('password')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-500">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password" className="text-sm font-medium text-foreground">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className="pl-10 pr-10 h-11 transition-colors focus:ring-2 focus:ring-primary/20"
                      {...registerForm.register('confirmPassword')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {registerForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  size="lg"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <Separator className="my-4" />
                <p className="text-xs text-center text-muted-foreground">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="text-primary hover:text-primary/80">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:text-primary/80">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
