import { Skeleton } from '@/components/ui/loading';

/**
 * Hero Section Skeleton
 * Matches the HeroSection component structure with slider, content, and indicators
 */
export function HeroSectionSkeleton() {
  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
      {/* Background Image Skeleton */}
      <div className="absolute inset-0">
        <Skeleton className="h-full w-full" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Skeleton */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white space-y-6">
          {/* Badge */}
          <Skeleton className="h-6 w-24 rounded-md bg-white/20" />

          {/* Subtitle */}
          <Skeleton className="h-5 w-40 bg-white/20" />

          {/* Title */}
          <Skeleton className="h-16 w-full max-w-lg bg-white/20" />

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-full bg-white/20" />
            <Skeleton className="h-6 w-4/5 bg-white/20" />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Skeleton className="h-12 w-40 rounded-md bg-white/20" />
            <Skeleton className="h-12 w-36 rounded-md bg-white/20" />
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
        <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
        <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {[...Array(3)].map((_, index) => (
          <Skeleton key={index} className="w-3 h-3 rounded-full bg-white/20" />
        ))}
      </div>
    </section>
  );
}

/**
 * Category Grid Skeleton
 * Matches the CategoryGrid component with 4-column grid layout
 */
export function CategoryGridSkeleton() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <div className="space-y-2 max-w-2xl mx-auto">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5 mx-auto" />
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="group">
              <div className="overflow-hidden rounded-xl shadow-lg">
                <div className="relative h-48 overflow-hidden rounded-xl">
                  <Skeleton className="h-48 w-full" />

                  {/* Badge */}
                  <div className="absolute top-3 right-3">
                    <Skeleton className="h-6 w-20 rounded-md" />
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4 bg-white/20" />
                    <Skeleton className="h-4 w-full bg-white/20" />
                    <Skeleton className="h-4 w-24 bg-white/20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Category Highlight */}
        <div className="mt-12 text-center">
          <Skeleton className="h-12 w-80 mx-auto rounded-full" />
        </div>
      </div>
    </section>
  );
}

/**
 * Featured Products Skeleton
 * Matches the FeaturedProducts component with header, grid, and CTA
 */
export function FeaturedProductsSkeleton() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div className="flex-1">
            <Skeleton className="h-10 w-64 mb-4" />
            <div className="space-y-2 max-w-2xl">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
            </div>
          </div>
          <Skeleton className="h-10 w-40 mt-4 md:mt-0 rounded-md" />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="group overflow-hidden border-0 shadow-md bg-card rounded-lg">
              {/* Image section */}
              <div className="relative overflow-hidden">
                <Skeleton className="h-48 w-full" />

                {/* Badges */}
                <div className="absolute top-3 left-3">
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>

                {/* Action button */}
                <div className="absolute top-3 right-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>

              {/* Content section */}
              <div className="p-4 space-y-3">
                <Skeleton className="h-7 w-4/5" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-3 w-3" />
                  ))}
                  <Skeleton className="h-3 w-8 ml-1" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>

              {/* Footer */}
              <div className="p-4 pt-0">
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-8 rounded-2xl">
            <div className="text-center space-y-4">
              <Skeleton className="h-8 w-64 mx-auto" />
              <div className="space-y-2 max-w-md mx-auto">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5 mx-auto" />
              </div>
              <Skeleton className="h-12 w-40 mx-auto rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * USP Highlights Skeleton
 * Matches the USPHighlights component with 3-column grid of feature cards
 */
export function USPHighlightsSkeleton() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <div className="space-y-2 max-w-2xl mx-auto">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5 mx-auto" />
          </div>
        </div>

        {/* USP Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="border-0 shadow-md bg-card rounded-lg">
              <div className="p-6 text-center space-y-4">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                  <Skeleton className="h-8 w-8" />
                </div>

                {/* Title */}
                <Skeleton className="h-6 w-32 mx-auto" />

                {/* Description */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5 mx-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Pre-Order Guide Skeleton
 * Matches the PreOrderGuide component with 4-column grid of process steps
 */
export function PreOrderGuideSkeleton() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Skeleton className="h-6 w-32 mx-auto mb-4 rounded-md" />
          <Skeleton className="h-10 w-80 mx-auto mb-4" />
          <div className="space-y-2 max-w-2xl mx-auto">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5 mx-auto" />
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 relative">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="relative flex flex-col">
              {/* Step Number */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-30">
                <Skeleton className="w-10 h-10 rounded-full" />
              </div>

              {/* Card */}
              <div className="border-0 shadow-md bg-card rounded-lg pt-8">
                <div className="p-6 text-center space-y-4">
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                    <Skeleton className="h-8 w-8" />
                  </div>

                  {/* Title */}
                  <Skeleton className="h-6 w-32 mx-auto" />

                  {/* Description */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5 mx-auto" />
                  </div>
                </div>
              </div>

              {/* Connector Arrow */}
              {index < 3 && (
                <div className="hidden lg:flex absolute top-1/2 -right-4 transform -translate-y-1/2 translate-x-1/2 z-20">
                  <Skeleton className="w-6 h-0.5" />
                  <Skeleton className="w-2 h-2 ml-1" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-8 rounded-2xl">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64 mx-auto" />
              <div className="space-y-2 max-w-md mx-auto">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5 mx-auto" />
              </div>
              <Skeleton className="h-12 w-40 mx-auto rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Reviews Carousel Skeleton
 * Matches the ReviewsCarousel component with carousel layout
 */
export function ReviewsCarouselSkeleton() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <div className="space-y-2 max-w-2xl mx-auto">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5 mx-auto" />
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border-0 shadow-md bg-card rounded-lg">
              <div className="p-6 space-y-4">
                {/* Rating */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-4" />
                  ))}
                </div>

                {/* Review Text */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 pt-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Controls */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex gap-2">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="w-2 h-2 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </section>
  );
}

/**
 * Complete Home Page Skeleton
 * Combines all home section skeletons for full page loading
 */
export function HomePageSkeleton() {
  return (
    <div className="min-h-screen">
      <HeroSectionSkeleton />
      <CategoryGridSkeleton />
      <FeaturedProductsSkeleton />
      <USPHighlightsSkeleton />
      <PreOrderGuideSkeleton />
      <ReviewsCarouselSkeleton />
    </div>
  );
}
