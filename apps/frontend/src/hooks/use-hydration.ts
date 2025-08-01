'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useBookmarksStore } from '@/store/bookmarks-store';

/**
 * Hook to ensure proper hydration of client-side stores
 * Prevents hydration mismatches and ensures data is available before rendering
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);
  const cartHydrated = useCartStore(state => state.isHydrated);
  const bookmarksHydrated = useBookmarksStore(state => state.isHydrated);

  useEffect(() => {
    // Only set hydrated when both stores are ready
    if (cartHydrated && bookmarksHydrated) {
      setIsHydrated(true);
    }
  }, [cartHydrated, bookmarksHydrated]);

  return {
    isHydrated,
    cartHydrated,
    bookmarksHydrated,
  };
}

/**
 * Hook to get cart data with hydration safety
 */
export function useCartWithHydration() {
  const { isHydrated } = useHydration();
  const cart = useCartStore();

  return {
    ...cart,
    isHydrated,
    // Return empty state until hydrated to prevent mismatches
    items: isHydrated ? cart.items : [],
    getTotalItems: isHydrated ? cart.getTotalItems : () => 0,
    getTotalPrice: isHydrated ? cart.getTotalPrice : () => 0,
  };
}

/**
 * Hook to get bookmarks data with hydration safety
 */
export function useBookmarksWithHydration() {
  const { isHydrated } = useHydration();
  const bookmarks = useBookmarksStore();

  return {
    ...bookmarks,
    isHydrated,
    // Return empty state until hydrated to prevent mismatches
    bookmarkedProducts: isHydrated ? bookmarks.bookmarkedProducts : [],
    getBookmarkCount: isHydrated ? bookmarks.getBookmarkCount : () => 0,
    isBookmarked: isHydrated ? bookmarks.isBookmarked : () => false,
  };
}
