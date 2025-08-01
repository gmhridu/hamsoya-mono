/**
 * Products Page - App Router
 * Server-side rendered products listing with instant cart and bookmark data hydration
 * No loading states or client-side flashing
 */

import { ProductsClient } from '@/components/products/products-client';
import { BRAND_NAME } from '@/lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Products - ${BRAND_NAME} | Premium Organic Food Products`,
  description:
    'Browse our collection of premium organic food products including pure ghee, natural honey, spices, and traditional foods. Fresh delivery across Bangladesh.',
  keywords:
    'organic products, pure ghee, natural honey, spices, traditional food, Bangladesh, online grocery, premium quality',
  openGraph: {
    title: `Products - ${BRAND_NAME}`,
    description:
      'Browse our collection of premium organic food products including pure ghee, natural honey, spices, and traditional foods.',
    type: 'website',
    url: 'https://hamsoya.com/products',
  },
  alternates: {
    canonical: 'https://hamsoya.com/products',
  },
};

/**
 * Products page with centralized authentication
 * User data provided by ServerAuthProvider - zero API calls, zero loading states
 */
export default function ProductsPage() {
  // User data is provided by ServerAuthProvider in layout.tsx
  // No API calls needed - instant authentication state available via useServerAuth()

  return (
    <div className="min-h-screen">
      <ProductsClient />
    </div>
  );
}
