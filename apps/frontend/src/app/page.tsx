/**
 * Home Page - App Router with Streaming Support
 * Server-side rendered home page with streaming skeleton loaders for slow connections
 * Maintains fast performance for good connections while providing loading states for slow ones
 */

import { Suspense } from 'react';
import { StreamingHomePage } from '@/components/home/async-home-sections';
import { HomePageSkeleton } from '@/components/ui/home-skeletons';
import {
  OrganizationStructuredData,
  WebsiteStructuredData,
} from '@/components/seo/structured-data';
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
 * Home page with streaming support and skeleton loaders
 * - Fast users: Instant rendering with server-side data
 * - Slow users: Progressive loading with skeleton loaders
 * - Post-login navigation: Seamless client-side navigation
 */
export default function HomePage() {
  return (
    <>
      {/* Structured Data - Always rendered immediately */}
      <OrganizationStructuredData page="home" />
      <WebsiteStructuredData />

      {/* Main content with streaming support */}
      <Suspense fallback={<HomePageSkeleton />}>
        <StreamingHomePage />
      </Suspense>
    </>
  );
}
