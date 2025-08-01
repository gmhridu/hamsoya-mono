/**
 * Order/Checkout Page - App Router
 * Server-side protected route that requires authentication
 * Professional checkout UX with instant user data
 */

import { OrderClient } from '@/components/order/order-client';
import { BRAND_NAME } from '@/lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Checkout - ${BRAND_NAME} | Complete Your Order`,
  description:
    'Complete your order with secure checkout. Fast delivery of premium organic food products across Bangladesh.',
  keywords: 'checkout, order, payment, delivery, hamsoya, organic food',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Protected checkout page that requires authentication
 * Middleware handles authentication redirects server-side for instant UX
 * User data provided by ServerAuthProvider - zero API calls, zero loading states
 */
export default function OrderPage() {
  // Middleware ensures only authenticated users reach this page
  // User data is provided by ServerAuthProvider in layout.tsx
  // No API calls needed - instant authentication state available via useServerAuth()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <OrderClient />
      </div>
    </div>
  );
}
