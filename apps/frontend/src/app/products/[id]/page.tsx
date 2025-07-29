import { ProductDetailClient } from '@/components/products/product-detail-client';
import { BreadcrumbStructuredData, ProductStructuredData } from '@/components/seo/structured-data';
import { BRAND_NAME } from '@/lib/constants';
import { getProductById, mockProducts, mockReviews } from '@/lib/mock-data';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Generate dynamic metadata for each product
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return {
      title: 'Product Not Found - Hamsoya',
      description: 'The product you are looking for could not be found.',
    };
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountText =
    hasDiscount && product.originalPrice
      ? ` - ${Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )}% Off`
      : '';

  return {
    title: `${product.name}${discountText} | ${BRAND_NAME}`,
    description: product.description,
    keywords: `${product.name}, ${product.category}, organic food, ${
      product.tags?.join(', ') || ''
    }, ${BRAND_NAME}`,
    openGraph: {
      title: `${product.name} | ${BRAND_NAME}`,
      description: product.description,
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ${BRAND_NAME}`,
      description: product.description,
      images: [product.images[0]],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  // Server-side data fetching
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  // Get related data
  const productReviews = mockReviews.filter(review => review.productId === product.id);
  const relatedProducts = mockProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Breadcrumb data for structured data
  const breadcrumbItems = [
    { name: 'Home', url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000' },
    {
      name: 'Products',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products`,
    },
    {
      name: product.name,
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products/${product.id}`,
    },
  ];

  return (
    <>
      {/* Structured Data */}
      <ProductStructuredData product={product} reviews={productReviews} />
      <BreadcrumbStructuredData items={breadcrumbItems} />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary">
              Products
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </nav>

        {/* Client Component for interactive functionality */}
        <ProductDetailClient
          product={product}
          reviews={productReviews}
          relatedProducts={relatedProducts}
        />
      </div>
    </>
  );
}

// Generate static params for better performance (optional)
export async function generateStaticParams() {
  return mockProducts.map(product => ({
    id: product.id,
  }));
}
