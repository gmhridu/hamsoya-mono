import { Suspense } from 'react';
import { ProductGridSkeleton, GenericPageSkeleton } from '@/components/ui/loading';

/**
 * Example: Products page with streaming support
 * Shows how to implement streaming for product listings
 */
async function AsyncProductsContent() {
  // Simulate async data fetching
  await new Promise(resolve => setTimeout(resolve, 0));
  
  // In real implementation, this would fetch products from API
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">Discover our wide range of high-quality products</p>
      </div>
      
      {/* Products would be rendered here */}
      <div className="text-center py-12">
        <p className="text-muted-foreground">Products loaded successfully!</p>
      </div>
    </div>
  );
}

export function StreamingProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Discover our wide range of high-quality products</p>
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    }>
      <AsyncProductsContent />
    </Suspense>
  );
}

/**
 * Example: Generic page with streaming support
 * Template for other pages that need loading states
 */
async function AsyncGenericContent({ title, description }: { title: string; description: string }) {
  // Simulate async data fetching
  await new Promise(resolve => setTimeout(resolve, 0));
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Content Section</h2>
          <p className="text-muted-foreground">
            This is an example of how to implement streaming for any page in your application.
            The skeleton loader will show while the content is loading.
          </p>
        </div>
      </div>
    </div>
  );
}

export function StreamingGenericPage({ title, description }: { title: string; description: string }) {
  return (
    <Suspense fallback={<GenericPageSkeleton />}>
      <AsyncGenericContent title={title} description={description} />
    </Suspense>
  );
}

/**
 * Example: Dashboard page with streaming support
 * Shows how to implement streaming for authenticated pages
 */
async function AsyncDashboardContent() {
  // Simulate async data fetching for user dashboard
  await new Promise(resolve => setTimeout(resolve, 0));
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your personal dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard widgets would go here */}
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Recent Orders</h3>
          <p className="text-muted-foreground">Your recent order history</p>
        </div>
        
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Bookmarks</h3>
          <p className="text-muted-foreground">Your saved products</p>
        </div>
        
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Account</h3>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>
      </div>
    </div>
  );
}

export function StreamingDashboardPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your personal dashboard</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-card rounded-lg p-6 shadow-sm">
              <div className="animate-pulse">
                <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <AsyncDashboardContent />
    </Suspense>
  );
}

/**
 * Usage Instructions:
 * 
 * 1. For the home page:
 *    - Use StreamingHomePage from async-home-sections.tsx
 *    - Already implemented in app/page.tsx
 * 
 * 2. For products page:
 *    - Use StreamingProductsPage in app/products/page.tsx
 * 
 * 3. For other pages:
 *    - Use StreamingGenericPage as a template
 *    - Customize the skeleton to match your page layout
 * 
 * 4. For authenticated pages:
 *    - Use StreamingDashboardPage as a template
 *    - Add authentication checks as needed
 * 
 * 5. Post-login navigation:
 *    - Use useLoginFlow() hook in login components
 *    - Call handleLoginSuccess(redirectPath) after successful login
 *    - This provides seamless client-side navigation
 * 
 * Example implementation in a page:
 * 
 * ```tsx
 * // app/products/page.tsx
 * import { StreamingProductsPage } from '@/components/ui/streaming-examples';
 * 
 * export default function ProductsPage() {
 *   return <StreamingProductsPage />;
 * }
 * ```
 */
