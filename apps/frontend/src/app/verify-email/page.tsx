import { VerifyEmailClient } from '@/components/auth/verify-email-client';
import { redirectIfAuthenticated } from '@/lib/auth-redirects';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Email - Hamsoya | Complete Your Registration',
  description:
    'Enter the 6-digit verification code sent to your email to complete your Hamsoya account registration.',
  keywords: 'email verification, OTP, account verification, hamsoya, registration',
  openGraph: {
    title: 'Verify Email - Hamsoya | Complete Your Registration',
    description:
      'Enter the 6-digit verification code sent to your email to complete your Hamsoya account registration.',
    type: 'website',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default async function VerifyEmailPage() {
  // Server-side redirect for authenticated users
  // This ensures zero client-side rendering for authenticated users
  await redirectIfAuthenticated('/');

  return <VerifyEmailClient />;
}
