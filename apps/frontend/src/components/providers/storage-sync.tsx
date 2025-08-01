/**
 * Storage Sync Component
 * Syncs server-side storage data with client-side Zustand stores
 * Uses useLayoutEffect to sync immediately before paint to prevent flicker
 * Ensures bidirectional sync for complete state consistency
 */

'use client';

import { useServerStorage } from '@/components/providers/enhanced-server-storage-provider';
import { useBookmarksStore } from '@/store/bookmarks-store';
import { useCartStore } from '@/store/cart-store';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

export function StorageSync() {
  const { cart, bookmarks, updateCart, updateBookmarks } = useServerStorage();
  const {
    items: cartItems,
    initializeFromServer: initCartFromServer,
    syncWithBackend: syncCartWithBackend,
    getTotalItems,
    getTotalPrice,
    isHydrated: cartHydrated,
  } = useCartStore();
  const {
    bookmarkedProducts,
    initializeFromServer: initBookmarksFromServer,
    syncWithBackend: syncBookmarksWithBackend,
    getBookmarkCount,
    isHydrated: bookmarksHydrated,
  } = useBookmarksStore();

  // Track if initialization has been completed to prevent multiple calls
  const initializationRef = useRef({ cart: false, bookmarks: false });

  // Stabilize server data objects to prevent unnecessary re-renders
  const stableCartData = useMemo(
    () => ({
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
    }),
    [cart.items, cart.totalItems, cart.totalPrice]
  );

  const stableBookmarksData = useMemo(
    () => ({
      bookmarkedProducts: bookmarks.bookmarkedProducts,
      bookmarkCount: bookmarks.bookmarkCount,
    }),
    [bookmarks.bookmarkedProducts, bookmarks.bookmarkCount]
  );

  // Use useLayoutEffect to sync server-side data with client-side stores immediately
  useLayoutEffect(() => {
    // Only initialize if not already hydrated and not already initialized
    if (!cartHydrated && !initializationRef.current.cart) {
      initCartFromServer(stableCartData);
      initializationRef.current.cart = true;
    }

    if (!bookmarksHydrated && !initializationRef.current.bookmarks) {
      initBookmarksFromServer(stableBookmarksData);
      initializationRef.current.bookmarks = true;
    }

    // Mark performance milestones only once
    if (cartHydrated && bookmarksHydrated && typeof window !== 'undefined') {
      // Dynamic import to avoid SSR issues
      import('@/lib/performance-monitor').then(
        ({ markHydrationComplete, markCartLoaded, markBookmarkLoaded }) => {
          markHydrationComplete();
          markCartLoaded();
          markBookmarkLoaded();
        }
      );
    }
  }, [
    stableCartData,
    stableBookmarksData,
    initCartFromServer,
    initBookmarksFromServer,
    cartHydrated,
    bookmarksHydrated,
  ]);

  // Sync with backend on mount to ensure data is up-to-date
  useEffect(() => {
    const syncData = async () => {
      try {
        await Promise.all([syncCartWithBackend(), syncBookmarksWithBackend()]);
      } catch (error) {
        console.warn('Failed to sync with backend:', error);
      }
    };

    syncData();
  }, [syncCartWithBackend, syncBookmarksWithBackend]);

  // Listen for client-side store changes and sync back to server provider
  useEffect(() => {
    const currentCartData = {
      items: cartItems,
      totalItems: getTotalItems(),
      totalPrice: getTotalPrice(),
    };

    // Only update if data has changed
    if (
      currentCartData.totalItems !== cart.totalItems ||
      currentCartData.totalPrice !== cart.totalPrice ||
      currentCartData.items.length !== cart.items.length
    ) {
      updateCart(currentCartData);
    }
  }, [cartItems, cart, updateCart, getTotalItems, getTotalPrice]);

  useEffect(() => {
    const currentBookmarksData = {
      bookmarkedProducts: bookmarkedProducts,
      bookmarkCount: getBookmarkCount(),
    };

    // Only update if data has changed
    if (
      currentBookmarksData.bookmarkCount !== bookmarks.bookmarkCount ||
      currentBookmarksData.bookmarkedProducts.length !== bookmarks.bookmarkedProducts.length
    ) {
      updateBookmarks(currentBookmarksData);
    }
  }, [bookmarkedProducts, bookmarks, updateBookmarks, getBookmarkCount]);

  // Listen for storage events and trigger updates
  useEffect(() => {
    const handleStorageUpdate = () => {
      // Trigger server provider updates
      const cartData = {
        items: cartItems,
        totalItems: getTotalItems(),
        totalPrice: getTotalPrice(),
      };

      const bookmarksData = {
        bookmarkedProducts: bookmarkedProducts,
        bookmarkCount: getBookmarkCount(),
      };

      // Dispatch custom events to notify server provider
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('storage:cart-update', { detail: cartData }));
        window.dispatchEvent(
          new CustomEvent('storage:bookmarks-update', { detail: bookmarksData })
        );
      }
    };

    // Listen for store changes
    const unsubscribeCart = useCartStore.subscribe(handleStorageUpdate);
    const unsubscribeBookmarks = useBookmarksStore.subscribe(handleStorageUpdate);

    return () => {
      unsubscribeCart();
      unsubscribeBookmarks();
    };
  }, [cartItems, bookmarkedProducts, getTotalItems, getTotalPrice, getBookmarkCount]);

  return null; // This component doesn't render anything
}
