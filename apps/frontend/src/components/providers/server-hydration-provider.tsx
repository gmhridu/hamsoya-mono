'use client';

import type { ServerStorageData } from '@/lib/server-storage';
import { useBookmarksStore } from '@/store/bookmarks-store';
import { useCartStore } from '@/store/cart-store';
import React from 'react';

interface ServerHydrationProviderProps {
  children: React.ReactNode;
  serverStorage?: ServerStorageData;
}

/**
 * Server Hydration Provider
 * Initializes client stores with server-side data to eliminate loading states
 * Ensures immediate availability of cart and bookmark data
 */
export function ServerHydrationProvider({ children, serverStorage }: ServerHydrationProviderProps) {
  const cartStore = useCartStore();
  const bookmarksStore = useBookmarksStore();

  // Initialize stores with server data using useEffect to ensure proper timing
  // Note: This is a fallback initialization - primary initialization should happen in StorageSync
  React.useEffect(() => {
    if (serverStorage && typeof window !== 'undefined') {
      // Only initialize if stores are not hydrated and we have server data
      // This prevents conflicts with StorageSync component
      if (!cartStore.isHydrated && serverStorage.cart && serverStorage.cart.items) {
        cartStore.initializeFromServer(serverStorage.cart);
      }

      if (
        !bookmarksStore.isHydrated &&
        serverStorage.bookmarks &&
        serverStorage.bookmarks.bookmarkedProducts
      ) {
        bookmarksStore.initializeFromServer(serverStorage.bookmarks);
      }
    }
  }, [
    serverStorage?.cart?.totalItems,
    serverStorage?.bookmarks?.bookmarkCount,
    cartStore.isHydrated,
    bookmarksStore.isHydrated,
  ]);

  return <>{children}</>;
}

/**
 * Hook to use server storage data
 */
export function useServerStorage(serverStorage?: ServerStorageData) {
  const cartStore = useCartStore();
  const bookmarksStore = useBookmarksStore();

  // Initialize stores with server data using useEffect to ensure proper timing
  // Note: This is disabled to prevent conflicts with StorageSync component
  // The StorageSync component handles all initialization
  React.useEffect(() => {
    // Initialization is handled by StorageSync component to prevent conflicts
    // This hook is kept for backward compatibility but does not initialize stores
  }, []);

  return {
    isHydrated: cartStore.isHydrated && bookmarksStore.isHydrated,
    cart: cartStore,
    bookmarks: bookmarksStore,
  };
}
