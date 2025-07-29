import { Metadata } from 'next';
import { BookmarksClient } from '@/components/bookmarks/bookmarks-client';

export const metadata: Metadata = {
  title: 'My Bookmarks - Hamsoya | Saved Products',
  description: 'View and manage your bookmarked organic food products. Save your favorite items for easy access and quick ordering.',
  keywords: 'bookmarks, saved products, favorites, wishlist, organic food, hamsoya',
  openGraph: {
    title: 'My Bookmarks - Hamsoya | Saved Products',
    description: 'View and manage your bookmarked organic food products. Save your favorite items for easy access and quick ordering.',
    type: 'website',
  },
  robots: {
    index: false, // Don't index user-specific pages
    follow: true,
  },
};

export default function BookmarksPage() {
  return <BookmarksClient />;
}
