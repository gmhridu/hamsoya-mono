import { BookmarksClient } from '@/components/bookmarks/bookmarks-client';
import { redirectIfNotAuthenticated } from '@/lib/auth-redirects';
import { getServerBookmarkCount } from '@/lib/enhanced-server-storage-cache';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Bookmarks - Hamsoya | Saved Products',
  description:
    'View and manage your bookmarked organic food products. Save your favorite items for easy access and quick ordering.',
  keywords: 'bookmarks, saved products, favorites, wishlist, organic food, hamsoya',
  openGraph: {
    title: 'My Bookmarks - Hamsoya | Saved Products',
    description:
      'View and manage your bookmarked organic food products. Save your favorite items for easy access and quick ordering.',
    type: 'website',
  },
  robots: {
    index: false, // Don't index user-specific pages
    follow: true,
  },
};

export default async function BookmarksPage() {
  // Server-side authentication check - redirects if not authenticated
  await redirectIfNotAuthenticated('/bookmarks');

  // Get server-side bookmark count to prevent flashing
  const initialBookmarkCount = await getServerBookmarkCount();

  return <BookmarksClient initialBookmarkCount={initialBookmarkCount} />;
}
