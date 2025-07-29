import { CategoryGrid } from '@/components/home/category-grid';
import { FeaturedProducts } from '@/components/home/featured-products';
import { HeroSection } from '@/components/home/hero-section';
import { PreOrderGuide } from '@/components/home/preorder-guide';
import { ReviewsCarousel } from '@/components/home/reviews-carousel';
import { USPHighlights } from '@/components/home/usp-highlights';
import {
  OrganizationStructuredData,
  WebsiteStructuredData,
} from '@/components/seo/structured-data';
import { BRAND_NAME } from '@/lib/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `${BRAND_NAME} | Premium Organic Food Products in Bangladesh`,
  description:
    'Discover premium organic food products including pure ghee, natural honey, spices, and traditional foods. Free delivery across Bangladesh with cash on delivery.',
  keywords:
    'organic food, pure ghee, natural honey, spices, traditional food, online grocery, bangladesh, cash on delivery, free delivery',
  openGraph: {
    title: `${BRAND_NAME} | Premium Organic Food Products in Bangladesh`,
    description:
      'Discover premium organic food products including pure ghee, natural honey, spices, and traditional foods. Free delivery across Bangladesh with cash on delivery.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND_NAME} | Premium Organic Food Products in Bangladesh`,
    description:
      'Discover premium organic food products including pure ghee, natural honey, spices, and traditional foods.',
  },
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <>
      {/* Structured Data */}
      <OrganizationStructuredData page="home" />
      <WebsiteStructuredData />

      <div className="min-h-screen">
        <HeroSection />
        <CategoryGrid />
        <FeaturedProducts />
        <USPHighlights />
        <PreOrderGuide />
        <ReviewsCarousel />
      </div>
    </>
  );
}
