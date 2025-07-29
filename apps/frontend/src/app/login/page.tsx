import { Metadata } from 'next';
import { LoginClient } from '@/components/auth/login-client';

export const metadata: Metadata = {
  title: 'Login - Hamsoya | Sign In to Your Account',
  description: 'Sign in to your Hamsoya account to access your orders, bookmarks, and enjoy a personalized shopping experience.',
  keywords: 'login, sign in, account, hamsoya, organic food, user account',
  openGraph: {
    title: 'Login - Hamsoya | Sign In to Your Account',
    description: 'Sign in to your Hamsoya account to access your orders, bookmarks, and enjoy a personalized shopping experience.',
    type: 'website',
  },
  robots: {
    index: false, 
    follow: true,
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
