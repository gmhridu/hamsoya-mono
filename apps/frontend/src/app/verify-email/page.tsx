import { Metadata } from 'next';
import { VerifyEmailClient } from '@/components/auth/verify-email-client';

export const metadata: Metadata = {
  title: 'Verify Email - Hamsoya | Complete Your Registration',
  description: 'Enter the 6-digit verification code sent to your email to complete your Hamsoya account registration.',
  keywords: 'email verification, OTP, account verification, hamsoya, registration',
  openGraph: {
    title: 'Verify Email - Hamsoya | Complete Your Registration',
    description: 'Enter the 6-digit verification code sent to your email to complete your Hamsoya account registration.',
    type: 'website',
  },
  robots: {
    index: false, 
    follow: true,
  },
};

export default function VerifyEmailPage() {
  return <VerifyEmailClient />;
}
