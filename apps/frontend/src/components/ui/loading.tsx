import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Loading({ size = 'md', className }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted/80 relative overflow-hidden',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent',
        className
      )}
    />
  );
}

interface ProductCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export function ProductCardSkeleton({ viewMode = 'grid' }: ProductCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <div className="group overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card rounded-lg flex min-h-[220px]">
        {/* Image skeleton */}
        <div className="relative overflow-hidden w-[240px] flex-shrink-0 p-3">
          <div className="relative h-[256px] w-full rounded-lg overflow-hidden bg-gray-50">
            <Skeleton className="h-[256px] w-full rounded-lg" />
          </div>

          {/* Badge skeletons */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>

          {/* Bookmark button skeleton */}
          <div className="absolute top-4 right-4">
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="py-4 px-4 flex-1 flex flex-col justify-between min-h-0">
          <div className="flex-1 space-y-2">
            {/* Title */}
            <Skeleton className="h-6 w-3/4" />

            {/* Description */}
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            {/* Category and Origin badges */}
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-18 rounded-full" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-3.5 w-3.5 rounded-sm" />
              ))}
              <Skeleton className="h-3 w-8 ml-1.5" />
            </div>

            {/* Price */}
            <Skeleton className="h-6 w-20" />
          </div>

          <div className="mt-4 space-y-2">
            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>

            {/* Add to Cart Button */}
            <div className="flex justify-start">
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view - matches exact ProductCard structure
  return (
    <div className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-card rounded-lg">
      {/* Card Content */}
      <div className="p-0">
        {/* Image section */}
        <div className="relative overflow-hidden">
          <div className="relative h-48 w-full">
            <Skeleton className="h-48 w-full" />
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>

          {/* Action button */}
          <div className="absolute top-3 right-3">
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>

        {/* Content section */}
        <div className="p-4">
          {/* Title */}
          <Skeleton className="h-7 w-4/5 mb-2" />

          {/* Description */}
          <div className="space-y-1 mb-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-3" />
            ))}
            <Skeleton className="h-3 w-8 ml-1" />
          </div>

          {/* Price */}
          <Skeleton className="h-6 w-20 mb-4" />
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 pt-0">
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Skeleton className="h-full w-full" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-16 rounded-md" />
            </div>

            {/* Bookmark Button */}
            <div className="absolute top-4 right-4">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>

          {/* Thumbnail Images */}
          <div className="flex gap-2 overflow-x-auto">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="flex-shrink-0 w-20 h-20 rounded-md" />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col h-full">
          <div className="flex-1 space-y-6">
            <div>
              {/* Title */}
              <Skeleton className="h-10 w-4/5 mb-4" />

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-4 rounded-sm" />
                  ))}
                  <Skeleton className="h-4 w-8 ml-2" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>

              {/* Price */}
              <Skeleton className="h-8 w-32 mb-6" />

              {/* Description */}
              <div className="space-y-2 mb-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>

              {/* Tags with color-coded badges */}
              <div className="space-y-3 mb-6">
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                {/* Category and Origin badges */}
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-18 rounded-full" />
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-card rounded-lg p-4 mb-6 border border-border/50">
                <Skeleton className="h-5 w-24 mb-3" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>

              {/* Benefits Preview */}
              <div className="mb-6">
                <Skeleton className="h-5 w-20 mb-3" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Skeleton className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                  <div className="ml-3.5">
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-16" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-5 w-8" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                </div>
              </div>

              <div className="flex gap-4">
                <Skeleton className="h-11 flex-1 rounded-md" />
                <Skeleton className="h-11 w-11 rounded-md" />
                <Skeleton className="h-11 w-11 rounded-md" />
              </div>
            </div>
          </div>

          {/* Product Features - moved to bottom for better balance */}
          <div className="mt-auto pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <Skeleton className="h-5 w-5 rounded-sm" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs Skeleton */}
      <div className="mb-16">
        {/* Tabs List */}
        <div className="flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-6">
          <Skeleton className="h-8 w-20 rounded-sm mr-1" />
          <Skeleton className="h-8 w-20 rounded-sm mr-1" />
          <Skeleton className="h-8 w-24 rounded-sm" />
        </div>

        {/* Tab Content */}
        <div className="bg-card rounded-lg border">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Skeleton className="h-6 w-32 mb-3" />
                <div className="space-y-3">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="space-y-1">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Skeleton className="h-6 w-24 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div>
        <Skeleton className="h-8 w-40 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} viewMode="grid" />
          ))}
        </div>
      </div>
    </>
  );
}

export function PageLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <Loading size="lg" className="mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Additional enhanced loading components
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} viewMode="grid" />
      ))}
    </div>
  );
}

export function InlineLoader({
  size = 'md',
  text,
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loading size={size} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

// Full page loader overlay
export function FullPageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <Loading size="lg" className="text-primary" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

// Button loading state
export function ButtonLoader({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  return <Loading size={size} className="text-current" />;
}
