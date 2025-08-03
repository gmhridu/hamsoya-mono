/**
 * Forgot Password OTP Verification Page - SSR Enabled
 * Allows users to verify the OTP sent to their email for password reset
 */

import { ForgotPasswordVerifyClient } from '@/components/auth/forgot-password-verify-client';
import { GuestLayout } from '@/components/layout/ssr-layout';
import { ForgotPasswordStructuredData } from '@/components/seo/forgot-password-structured-data';
import { getServerStorageData } from '@/lib/enhanced-server-storage-cache';
import { getCurrentUserInstant } from '@/lib/server-auth-cache';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Verify Code - Forgot Password - Hamsoya',
  description: 'Enter the verification code sent to your email to proceed with password reset.',
  robots: 'noindex, nofollow', // Prevent indexing of auth pages
};

export default async function ForgotPasswordVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  // Await searchParams in Next.js 15
  const params = await searchParams;

  // Server-side redirect if no email provided - prevents client-side flickering
  if (!params.email) {
    redirect('/forgot-password');
  }

  // Get server storage data for SSR
  const serverStorage = await getServerStorageData();

  return (
    <GuestLayout serverStorage={serverStorage}>
      <ForgotPasswordStructuredData page="verify" />
      <ForgotPasswordVerifyClient />
    </GuestLayout>
  );
}
