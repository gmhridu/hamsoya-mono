import { Suspense } from 'react';
import { CategoryGrid } from '@/components/home/category-grid';
import { FeaturedProducts } from '@/components/home/featured-products';
import { HeroSection } from '@/components/home/hero-section';
import { PreOrderGuide } from '@/components/home/preorder-guide';
import { ReviewsCarousel } from '@/components/home/reviews-carousel';
import { USPHighlights } from '@/components/home/usp-highlights';
import {
  HeroSectionSkeleton,
  CategoryGridSkeleton,
  FeaturedProductsSkeleton,
  USPHighlightsSkeleton,
  PreOrderGuideSkeleton,
  ReviewsCarouselSkeleton,
} from '@/components/ui/home-skeletons';

/**
 * Async wrapper for HeroSection with Suspense boundary
 * Simulates potential async data loading for hero content
 */
async function AsyncHeroSection() {
  // Simulate potential async operation (e.g., fetching hero slides from CMS)
  // In real implementation, this could fetch dynamic hero content
  await new Promise(resolve => setTimeout(resolve, 0));
  
  return <HeroSection />;
}

/**
 * Async wrapper for CategoryGrid with Suspense boundary
 * Simulates potential async data loading for categories
 */
async function AsyncCategoryGrid() {
  // Simulate potential async operation (e.g., fetching categories from API)
  await new Promise(resolve => setTimeout(resolve, 0));
  
  return <CategoryGrid />;
}

/**
 * Async wrapper for FeaturedProducts with Suspense boundary
 * Simulates potential async data loading for featured products
 */
async function AsyncFeaturedProducts() {
  // Simulate potential async operation (e.g., fetching featured products)
  await new Promise(resolve => setTimeout(resolve, 0));
  
  return <FeaturedProducts />;
}

/**
 * Async wrapper for USPHighlights with Suspense boundary
 * Simulates potential async data loading for USP content
 */
async function AsyncUSPHighlights() {
  // Simulate potential async operation (e.g., fetching USP data from CMS)
  await new Promise(resolve => setTimeout(resolve, 0));
  
  return <USPHighlights />;
}

/**
 * Async wrapper for PreOrderGuide with Suspense boundary
 * Simulates potential async data loading for guide content
 */
async function AsyncPreOrderGuide() {
  // Simulate potential async operation (e.g., fetching guide steps from CMS)
  await new Promise(resolve => setTimeout(resolve, 0));
  
  return <PreOrderGuide />;
}

/**
 * Async wrapper for ReviewsCarousel with Suspense boundary
 * Simulates potential async data loading for reviews
 */
async function AsyncReviewsCarousel() {
  // Simulate potential async operation (e.g., fetching reviews from API)
  await new Promise(resolve => setTimeout(resolve, 0));
  
  return <ReviewsCarousel />;
}

/**
 * Hero Section with Suspense boundary
 * Shows skeleton while loading
 */
export function SuspenseHeroSection() {
  return (
    <Suspense fallback={<HeroSectionSkeleton />}>
      <AsyncHeroSection />
    </Suspense>
  );
}

/**
 * Category Grid with Suspense boundary
 * Shows skeleton while loading
 */
export function SuspenseCategoryGrid() {
  return (
    <Suspense fallback={<CategoryGridSkeleton />}>
      <AsyncCategoryGrid />
    </Suspense>
  );
}

/**
 * Featured Products with Suspense boundary
 * Shows skeleton while loading
 */
export function SuspenseFeaturedProducts() {
  return (
    <Suspense fallback={<FeaturedProductsSkeleton />}>
      <AsyncFeaturedProducts />
    </Suspense>
  );
}

/**
 * USP Highlights with Suspense boundary
 * Shows skeleton while loading
 */
export function SuspenseUSPHighlights() {
  return (
    <Suspense fallback={<USPHighlightsSkeleton />}>
      <AsyncUSPHighlights />
    </Suspense>
  );
}

/**
 * Pre-Order Guide with Suspense boundary
 * Shows skeleton while loading
 */
export function SuspensePreOrderGuide() {
  return (
    <Suspense fallback={<PreOrderGuideSkeleton />}>
      <AsyncPreOrderGuide />
    </Suspense>
  );
}

/**
 * Reviews Carousel with Suspense boundary
 * Shows skeleton while loading
 */
export function SuspenseReviewsCarousel() {
  return (
    <Suspense fallback={<ReviewsCarouselSkeleton />}>
      <AsyncReviewsCarousel />
    </Suspense>
  );
}

/**
 * Complete streaming home page with all sections wrapped in Suspense
 * Each section can load independently with its own skeleton
 */
export function StreamingHomePage() {
  return (
    <div className="min-h-screen">
      <SuspenseHeroSection />
      <SuspenseCategoryGrid />
      <SuspenseFeaturedProducts />
      <SuspenseUSPHighlights />
      <SuspensePreOrderGuide />
      <SuspenseReviewsCarousel />
    </div>
  );
}

/**
 * Alternative: Single Suspense boundary for entire home page
 * Shows complete page skeleton while all sections load
 */
export function SingleSuspenseHomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <HeroSectionSkeleton />
        <CategoryGridSkeleton />
        <FeaturedProductsSkeleton />
        <USPHighlightsSkeleton />
        <PreOrderGuideSkeleton />
        <ReviewsCarouselSkeleton />
      </div>
    }>
      <div className="min-h-screen">
        <AsyncHeroSection />
        <AsyncCategoryGrid />
        <AsyncFeaturedProducts />
        <AsyncUSPHighlights />
        <AsyncPreOrderGuide />
        <AsyncReviewsCarousel />
      </div>
    </Suspense>
  );
}
