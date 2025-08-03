/**
 * Reset Password Page - SSR Enabled
 * Allows users to set a new password after OTP verification
 */

import { ResetPasswordClient } from '@/components/auth/reset-password-client';
import { GuestLayout } from '@/components/layout/ssr-layout';
import { ForgotPasswordStructuredData } from '@/components/seo/forgot-password-structured-data';
import { getServerStorageData } from '@/lib/enhanced-server-storage-cache';
import { getCurrentUserInstant } from '@/lib/server-auth-cache';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export const metadata: Metadata = {
  title: 'Reset Password - Hamsoya',
  description: 'Set a new password for your Hamsoya account.',
  robots: 'noindex, nofollow', // Prevent indexing of auth pages
};

export default async function ResetPasswordPage({
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

  // Check if OTP verification was completed - security check
  try {
    const verificationResult = await apiClient.checkPasswordResetVerification(params.email) as { verified: boolean };
    if (!verificationResult.verified) {
      // Redirect to verification page if OTP not verified
      redirect(`/forgot-password/verify?email=${encodeURIComponent(params.email)}`);
    }
  } catch (error) {
    // If verification check fails, redirect to start of flow
    redirect('/forgot-password');
  }

  // Get server storage data for SSR
  const serverStorage = await getServerStorageData();

  return (
    <GuestLayout serverStorage={serverStorage}>
      <ForgotPasswordStructuredData page="reset" />
      <ResetPasswordClient />
    </GuestLayout>
  );
}
