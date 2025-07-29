import { Metadata } from 'next';
import { OrderClient } from '@/components/order/order-client';

export const metadata: Metadata = {
  title: 'Checkout - Hamsoya | Complete Your Order',
  description: 'Complete your order with cash on delivery. Free delivery across Bangladesh for all organic food products.',
  keywords: 'checkout, order, cash on delivery, free delivery, organic food, bangladesh',
  openGraph: {
    title: 'Checkout - Hamsoya | Complete Your Order',
    description: 'Complete your order with cash on delivery. Free delivery across Bangladesh for all organic food products.',
    type: 'website',
  },
  robots: {
    index: false, // Don't index checkout pages
    follow: true,
  },
};

export default function OrderPage() {
  return <OrderClient />;
}
