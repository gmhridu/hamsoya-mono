import { ProductsClient } from '@/components/products/products-client';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products - Hamsoya | Premium Organic Food Products',
  description:
    'Browse our premium collection of organic and natural food products including pure ghee, natural honey, spices, and traditional foods. Free delivery across Bangladesh.',
  keywords:
    'organic food products, pure ghee, natural honey, spices, traditional food, online grocery, bangladesh',
  openGraph: {
    title: 'Products - Hamsoya | Premium Organic Food Products',
    description:
      'Browse our premium collection of organic and natural food products including pure ghee, natural honey, spices, and traditional foods.',
    type: 'website',
  },
};

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">Our Products</h1>
        <p className="text-lg text-muted-foreground">
          Discover our premium collection of organic and natural products
        </p>
      </div>

      {/* Client Component for interactive functionality */}
      <ProductsClient />
    </div>
  );
}
