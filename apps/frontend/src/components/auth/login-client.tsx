'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileImageUpload } from '@/components/ui/profile-image-upload';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRegister } from '@/hooks/use-auth';
import { useOptimizedLogin } from '@/hooks/useOptimizedLogin';
import { useLogin } from '@/hooks/useLogin';
import { BRAND_NAME } from '@/lib/constants';
import { serverLoginAction, serverRegisterAction } from '@/lib/server-auth-actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader, Lock, Mail, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Form schemas
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

interface LoginClientProps {
  redirectTo?: string;
  error?: string;
  serverStorage?: any;
}

export function LoginClient({ redirectTo, error }: LoginClientProps = {}) {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);
  const [profileImageFileId, setProfileImageFileId] = useState<string | undefined>(undefined);

  // Use optimized login hook for server-side role-based redirects
  const optimizedLoginMutation = useOptimizedLogin();
  const registerMutation = useRegister();

  // Fallback to regular login hook if needed
  const loginMutation = useLogin();

  // Login form setup
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Register form setup
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
  });

  // Handle login form submission with server-side redirects
  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      // Use server action for instant server-side redirects
      await serverLoginAction({
        email: data.email,
        password: data.password,
        redirectTo: redirectTo, // Use provided redirect or role-based default
      });

      // If we reach here, the server action didn't redirect (unexpected)
      console.warn('[LOGIN] Server action completed without redirect, falling back to client-side');
      optimizedLoginMutation.login(data);
    } catch (error: any) {
      // NEXT_REDIRECT is expected behavior for server actions - don't treat as error
      if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
        console.log('[LOGIN] Server-side redirect successful');
        return; // Redirect is happening, don't fallback
      }

      console.error('Login submission error:', error);
      // Only fallback to client-side login for actual errors
      optimizedLoginMutation.login(data);
    }
  };

  // Handle register form submission with server-side redirects
  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      // Use server action for instant server-side redirects
      await serverRegisterAction({
        ...registerData,
        profile_image_url: profileImageUrl,
        redirectTo: undefined,
      });
    } catch (error: any) {
      // NEXT_REDIRECT is expected behavior for server actions - don't treat as error
      if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
        console.log('[REGISTER] Server-side redirect successful');
        return; // Redirect is happening, don't fallback
      }

      console.error('Registration submission error:', error);
      // Only fallback to client-side registration for actual errors
      const { confirmPassword, ...registerData } = data;
      registerMutation.mutate({
        ...registerData,
        role: 'USER' as const,
        profile_image_url: profileImageUrl,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-accent" />
            <span className="font-serif text-2xl font-bold text-primary">{BRAND_NAME}</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account or create a new one</p>
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

                  {/* Forgot Password Link */}
                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                    disabled={optimizedLoginMutation.isLoading}
                  >
                    {optimizedLoginMutation.isLoading? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
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
                        placeholder="01XXXXXXXXX"
                        className="pl-10 h-11 transition-colors focus:ring-2 focus:ring-primary/20"
                        {...registerForm.register('phone_number')}
                      />
                    </div>
                    {registerForm.formState.errors.phone_number && (
                      <p className="text-sm text-red-500">
                        {registerForm.formState.errors.phone_number.message}
                      </p>
                    )}
                  </div>

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
                        }}
                        onImageRemove={() => {
                          setProfileImageUrl(undefined);
                          setProfileImageFileId(undefined);
                        }}
                        size="lg"
                        preserveOnUnmount={true} // Don't delete image when component unmounts
                        isFormSubmitting={registerMutation.isPending} // Prevent deletion during form submission
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="register-password"
                      className="text-sm font-medium text-foreground"
                    >
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
                    <Label
                      htmlFor="register-confirm-password"
                      className="text-sm font-medium text-foreground"
                    >
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
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <User className="mr-2 h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <Separator className="my-8" />

            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                By continuing, you agree to our{' '}
                <Link
                  href="/terms"
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
