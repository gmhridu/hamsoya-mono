'use client';

import { Suspense } from 'react';
import { HomePageSkeleton } from '@/components/ui/home-skeletons';

/**
 * Template component for app router
 * Provides consistent loading states and transitions between pages
 * This wraps every page in the app directory
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      {children}
    </Suspense>
  );
}
