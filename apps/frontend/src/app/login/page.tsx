/**
 * Login Page - App Router
 * Server-side protected route that redirects authenticated users
 * Enhanced with instant server-side authentication for ChatGPT-style performance
 */

import { LoginClient } from '@/components/auth/login-client';
import { ServerActionLoginForm } from '@/components/auth/server-action-login-form';
import { BRAND_NAME } from '@/lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Login - ${BRAND_NAME} | Access Your Account`,
  description:
    'Sign in to your Hamsoya account to access your orders, bookmarks, and personalized shopping experience.',
  keywords: 'login, sign in, account, authentication, hamsoya',
  robots: {
    index: false,
    follow: false,
  },
};

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string;
    error?: string;
  }>;
}

/**
 * Login page with instant server-side authentication
 * Middleware handles redirects for authenticated users
 * Uses server actions for zero-loading-state login experience
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Middleware handles authentication redirects server-side
  // This eliminates client-side flashing and provides instant redirects

  const { redirect: redirectTo, error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="w-full max-w-md">
        {/* Use server action form for proper redirects */}
        <ServerActionLoginForm
          redirectTo={redirectTo}
          error={error}
        />

        {/* Fallback to client form if needed */}
        {/* <LoginClient
          redirectTo={redirectTo}
          error={error}
        /> */}
      </div>
    </div>
  );
}
