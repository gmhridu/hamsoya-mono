'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useBookmarksStore } from '@/store/bookmarks-store';
import { initializeEnhancedStorage } from '@/lib/enhanced-guest-storage';

interface HydrationProviderProps {
  children: React.ReactNode;
}

/**
 * Hydration Provider
 * Ensures proper initialization and hydration of client-side stores
 * Prevents hydration mismatches and ensures immediate data availability
 */
export function HydrationProvider({ children }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const cartHydrated = useCartStore(state => state.isHydrated);
  const bookmarksHydrated = useBookmarksStore(state => state.isHydrated);

  useEffect(() => {
    // Initialize enhanced storage system
    initializeEnhancedStorage();

    // Force rehydration of stores
    useCartStore.persist.rehydrate();
    useBookmarksStore.persist.rehydrate();

    // Set hydrated state when both stores are ready
    if (cartHydrated && bookmarksHydrated) {
      setIsHydrated(true);
    }
  }, [cartHydrated, bookmarksHydrated]);

  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        {/* Render a minimal loading state or skeleton */}
        <div className="animate-pulse">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
