/**
 * Home Page - App Router
 * Server-side rendered home page with instant authentication and data hydration
 * Professional UX with zero loading states
 */

import { HomeClient } from '@/components/home/home-client';
import { SEO_DEFAULTS } from '@/lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: SEO_DEFAULTS.title,
  description: SEO_DEFAULTS.description,
  keywords: SEO_DEFAULTS.keywords,
  openGraph: {
    title: SEO_DEFAULTS.title,
    description: SEO_DEFAULTS.description,
    type: 'website',
    url: 'https://hamsoya.com',
    images: [
      {
        url: SEO_DEFAULTS.ogImage,
        width: 1200,
        height: 630,
        alt: 'Hamsoya - Premium Organic Food Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_DEFAULTS.title,
    description: SEO_DEFAULTS.description,
    images: [SEO_DEFAULTS.ogImage],
  },
  alternates: {
    canonical: 'https://hamsoya.com',
  },
};

/**
 * Home page with centralized authentication
 * User data provided by ServerAuthProvider - zero API calls, zero loading states
 */
export default function HomePage() {
  // User data is provided by ServerAuthProvider in layout.tsx
  // No API calls needed - instant authentication state available via useServerAuth()

  return (
    <div className="min-h-screen">
      <HomeClient />
    </div>
  );
}
