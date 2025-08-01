'use client';

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
import type { ServerStorageData } from '@/lib/server-storage';

interface HomeClientProps {
  serverStorage?: ServerStorageData;
}

export function HomeClient({ serverStorage }: HomeClientProps) {
  // Suppress unused variable warnings - these may be used in future features
  void serverStorage;

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
