import { ContactUsClient } from '@/components/contact/contact-us-client';
import { ChunkErrorBoundary } from '@/components/ui/chunk-error-boundary';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Contact Us - Hamsoya | Get in Touch',
  description:
    'Contact Hamsoya for any questions about our organic food products, orders, or customer support. We are here to help you.',
  keywords: 'contact, customer support, help, questions, organic food, hamsoya, bangladesh',
  openGraph: {
    title: 'Contact Us - Hamsoya | Get in Touch',
    description:
      'Contact Hamsoya for any questions about our organic food products, orders, or customer support. We are here to help you.',
    type: 'website',
  },
};

// Loading component for Suspense
function ContactUsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function ContactUsPage() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<ContactUsLoading />}>
        <ContactUsClient />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
