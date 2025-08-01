'use client';

import { initializeStorage } from '@/lib/storage-sync';
import { useBookmarksStore } from '@/store/bookmarks-store';
import { useCartStore } from '@/store/cart-store';
import { ReactNode, useEffect } from 'react';

interface StorageProviderProps {
  children: ReactNode;
}

export function StorageProvider({ children }: StorageProviderProps) {
  useEffect(() => {
    // Initialize storage system
    initializeStorage();

    // Force rehydration of stores to ensure data is loaded
    if (typeof window !== 'undefined') {
      // Trigger rehydration if methods exist
      if ('persist' in useCartStore && typeof useCartStore.persist?.rehydrate === 'function') {
        useCartStore.persist.rehydrate();
      }

      if (
        'persist' in useBookmarksStore &&
        typeof useBookmarksStore.persist?.rehydrate === 'function'
      ) {
        useBookmarksStore.persist.rehydrate();
      }
    }
  }, []);

  // Subscribe to store changes for automatic persistence
  useEffect(() => {
    // Subscribe to cart changes
    const unsubscribeCart = useCartStore.subscribe(state => {
      // The persist middleware handles automatic saving
      // This subscription ensures we're aware of changes
      if (typeof window !== 'undefined' && state.isHydrated) {
        // Storage is automatically handled by persist middleware
      }
    });

    // Subscribe to bookmarks changes
    const unsubscribeBookmarks = useBookmarksStore.subscribe(state => {
      // The persist middleware handles automatic saving
      // This subscription ensures we're aware of changes
      if (typeof window !== 'undefined' && state.isHydrated) {
        // Storage is automatically handled by persist middleware
      }
    });

    return () => {
      unsubscribeCart();
      unsubscribeBookmarks();
    };
  }, []);

  return <>{children}</>;
}
