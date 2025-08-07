import { ContactUsClient } from '@/components/contact/contact-us-client';
import { ChunkErrorBoundary } from '@/components/ui/chunk-error-boundary';
import { Metadata } from 'next';

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

export default function ContactUsPage() {
  return (
    <ChunkErrorBoundary>
      <ContactUsClient />
    </ChunkErrorBoundary>
  );
}
