/**
 * Login Page - App Router
 * Server-side protected route that redirects authenticated users
 * Professional authentication UX with zero flashing
 */

import { LoginClient } from '@/components/auth/login-client';
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

/**
 * Login page with server-side authentication check
 * Middleware handles redirects for authenticated users
 * Provides smooth, flicker-free authentication UX
 */
export default async function LoginPage() {
  // Middleware handles authentication redirects server-side
  // This eliminates client-side flashing and provides instant redirects

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="w-full max-w-md">
        <LoginClient />
      </div>
    </div>
  );
}
