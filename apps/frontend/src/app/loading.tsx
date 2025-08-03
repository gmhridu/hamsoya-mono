import { HomePageSkeleton } from '@/components/ui/home-skeletons';

/**
 * Global loading UI for the app router
 * This will be shown when navigating between pages or when pages are loading
 * Specifically optimized for the home page but works for other pages too
 */
export default function Loading() {
  return <HomePageSkeleton />;
}
