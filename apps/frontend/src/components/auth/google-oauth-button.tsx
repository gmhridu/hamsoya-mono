'use client';

import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { useState } from 'react';

interface GoogleOAuthButtonProps {
  redirectTo?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function GoogleOAuthButton({
  redirectTo,
  disabled = false,
  className = '',
  variant = 'outline',
  size = 'default',
}: GoogleOAuthButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      // Use Next.js API route instead of direct backend call
      const googleAuthUrl = new URL('/api/auth/google', window.location.origin);
      if (redirectTo) {
        googleAuthUrl.searchParams.set('redirectTo', redirectTo);
      }

      // Redirect to Next.js API route which will proxy to backend
      window.location.href = googleAuthUrl.toString();
    } catch (error) {
      console.error('Google OAuth error:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={`w-full relative cursor-pointer ${className}`}
      onClick={handleGoogleLogin}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <Loader className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <svg
            className="h-4 w-4 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </>
      )}
    </Button>
  );
}

// OAuth separator component
export function OAuthSeparator() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-muted-foreground/20" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground font-medium">
          Or continue with
        </span>
      </div>
    </div>
  );
}

// OAuth error handler component
export function OAuthErrorHandler({ error, message }: { error?: string; message?: string }) {
  if (!error) return null;

  const getErrorMessage = (error: string, message?: string) => {
    switch (error) {
      case 'oauth_error':
        return message || 'Authentication failed. Please try again.';
      case 'access_denied':
        return 'Access was denied. Please try again and grant the necessary permissions.';
      case 'server_error':
        return 'Server error occurred. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
      <div className="flex items-center">
        <svg
          className="h-4 w-4 mr-2 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        {getErrorMessage(error, message)}
      </div>
    </div>
  );
}

// OAuth success handler component
export function OAuthSuccessHandler({ newUser }: { newUser?: boolean }) {
  if (!newUser) return null;

  return (
    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-6">
      <div className="flex items-center">
        <svg
          className="h-4 w-4 mr-2 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        Welcome! Your account has been created successfully.
      </div>
    </div>
  );
}
