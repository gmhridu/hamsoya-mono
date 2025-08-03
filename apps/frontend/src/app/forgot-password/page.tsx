/**
 * Forgot Password Page - SSR Enabled
 * Allows users to request a password reset OTP via email
 */


import { ForgotPasswordClient } from '@/components/auth/forgot-password-client';
import { GuestLayout } from '@/components/layout/ssr-layout';
import { ForgotPasswordStructuredData } from '@/components/seo/forgot-password-structured-data';
import { getServerStorageData } from '@/lib/enhanced-server-storage-cache';
import { getCurrentUserInstant } from '@/lib/server-auth-cache';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Forgot Password - Hamsoya',
  description: 'Reset your password to regain access to your Hamsoya account. Enter your email to receive a verification code.',
  robots: 'noindex, nofollow',
};

export default async function ForgotPasswordPage() {
  // Allow access regardless of authentication status
// Users might want to reset password even if they're logged in

  // Get server storage data for SSR
  const serverStorage = await getServerStorageData();

  return (
    <GuestLayout serverStorage={serverStorage}>
      <ForgotPasswordStructuredData page="forgot-password" />
      <ForgotPasswordClient />
    </GuestLayout>
  );
}
