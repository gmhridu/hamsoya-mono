import { Skeleton } from '@/components/ui/loading';

/**
 * Products Page Skeleton
 * Matches the ProductsClient component structure with filters, search, and grid
 */
export function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Filters and Controls */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filters */}
            <div className="lg:w-64 space-y-6">
              {/* Search */}
              <div>
                <Skeleton className="h-6 w-20 mb-3" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Categories */}
              <div>
                <Skeleton className="h-6 w-24 mb-3" />
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <Skeleton className="h-6 w-28 mb-3" />
                <div className="space-y-3">
                  <Skeleton className="h-2 w-full rounded-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              </div>

              {/* Ratings */}
              <div>
                <Skeleton className="h-6 w-20 mb-3" />
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, j) => (
                          <Skeleton key={j} className="h-3 w-3" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <Skeleton className="h-6 w-32" />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                  <div className="flex border rounded-md">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="group overflow-hidden border-0 shadow-md bg-card rounded-lg">
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
                        {[...Array(5)].map((_, j) => (
                          <Skeleton key={j} className="h-3 w-3" />
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

              {/* Pagination */}
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Product Detail Page Skeleton
 * Enhanced version with breadcrumb and proper layout matching
 */
export function ProductDetailPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </nav>

        {/* Product Detail Content */}
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
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-20 rounded-md" />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <Skeleton className="h-8 w-3/4 mb-3" />
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-4 w-4" />
                  ))}
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-16" />
                <div className="flex items-center border rounded-md">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>

              <div className="flex gap-3">
                <Skeleton className="h-12 flex-1 rounded-md" />
                <Skeleton className="h-12 w-12 rounded-md" />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mb-16">
          {/* Tab Headers */}
          <div className="flex border-b mb-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 mr-6" />
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-card rounded-lg border p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div>
          <Skeleton className="h-8 w-40 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="group overflow-hidden border-0 shadow-md bg-card rounded-lg">
                <div className="relative overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="absolute top-3 left-3">
                    <Skeleton className="h-6 w-20 rounded-md" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <Skeleton className="h-7 w-4/5" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="p-4 pt-0">
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * About Us Page Skeleton
 * Matches the AboutUsPage component structure with hero, story, mission, and values
 */
export function AboutUsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Skeleton className="h-6 w-24 mx-auto mb-6 rounded-md" />
            <Skeleton className="h-16 w-full max-w-2xl mx-auto mb-6" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-full max-w-xl mx-auto" />
              <Skeleton className="h-6 w-4/5 max-w-lg mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Skeleton className="h-10 w-32 mb-6" />
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Skeleton className="h-80 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="bg-card rounded-lg shadow-lg">
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <Skeleton className="h-8 w-32 mx-auto mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6 mx-auto" />
                    <Skeleton className="h-4 w-4/5 mx-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-32 mx-auto mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-96 mx-auto" />
              <Skeleton className="h-6 w-80 mx-auto" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-card rounded-lg shadow-md">
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <Skeleton className="h-6 w-24 mx-auto mb-3" />
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
    </div>
  );
}

/**
 * Contact Page Skeleton
 * Matches the ContactUsClient component structure with hero, contact info, and form
 */
export function ContactPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Skeleton className="h-6 w-24 mx-auto mb-6 rounded-md" />
            <Skeleton className="h-16 w-48 mx-auto mb-6" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-full max-w-xl mx-auto" />
              <Skeleton className="h-6 w-4/5 max-w-lg mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-48 mx-auto mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-96 mx-auto" />
              <Skeleton className="h-6 w-80 mx-auto" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-card rounded-lg shadow-md text-center">
                <div className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <Skeleton className="h-6 w-20 mx-auto mb-2" />
                  <Skeleton className="h-5 w-32 mx-auto mb-1" />
                  <Skeleton className="h-4 w-28 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-card rounded-lg shadow-lg">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  </div>

                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>

                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>

                  <div>
                    <Skeleton className="h-4 w-18 mb-2" />
                    <Skeleton className="h-24 w-full rounded-md" />
                  </div>

                  <Skeleton className="h-12 w-full rounded-md" />
                </div>
              </div>
            </div>

            {/* FAQ or Additional Info */}
            <div className="space-y-6">
              <div className="bg-card rounded-lg shadow-lg p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-lg shadow-lg p-6">
                <Skeleton className="h-6 w-28 mb-4" />
                <div className="flex justify-center space-x-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-10 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
