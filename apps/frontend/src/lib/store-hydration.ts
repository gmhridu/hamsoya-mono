/**
 * Store Hydration Utilities
 * Ensures Zustand stores are properly hydrated from server-side data
 * Eliminates hydration mismatches and loading states
 */

import { ServerStorageData } from '@/lib/server-storage-cache';
import { useBookmarksStore } from '@/store/bookmarks-store';
import { useCartStore } from '@/store/cart-store';

/**
 * Hydrate all stores with server-side data
 * Uses setTimeout to avoid React state update during render error
 * CRITICAL: Merges server data with existing localStorage data to prevent data loss
 */
export function hydrateStoresFromServer(serverStorage: ServerStorageData): void {
  if (typeof window === 'undefined') return;

  console.log('🔄 [StoreHydration] Starting store hydration with server data...');

  // Use setTimeout to defer state updates until after render
  setTimeout(() => {
    try {
      // Get current store states
      const cartStore = useCartStore.getState();
      const bookmarksStore = useBookmarksStore.getState();

      console.log('📊 [StoreHydration] Current store states:');
      console.log(`  Cart items: ${cartStore.items.length}`);
      console.log(`  Bookmarked products: ${bookmarksStore.bookmarkedProducts.length}`);
      console.log(`  Cart hydrated: ${cartStore.isHydrated}`);
      console.log(`  Bookmarks hydrated: ${bookmarksStore.isHydrated}`);

      // CRITICAL: Only initialize from server if stores are not already hydrated
      // This prevents server data from overwriting valid localStorage data

      if (!cartStore.isHydrated && serverStorage.cart) {
        console.log('🛒 [StoreHydration] Initializing cart from server data...');
        cartStore.initializeFromServer(serverStorage.cart);
      } else if (cartStore.isHydrated) {
        console.log('✅ [StoreHydration] Cart already hydrated, skipping server initialization');
      } else {
        console.log('❌ [StoreHydration] No server cart data available');
      }

      if (!bookmarksStore.isHydrated && serverStorage.bookmarks) {
        console.log('🔖 [StoreHydration] Initializing bookmarks from server data...');
        bookmarksStore.initializeFromServer(serverStorage.bookmarks);
      } else if (bookmarksStore.isHydrated) {
        console.log(
          '✅ [StoreHydration] Bookmarks already hydrated, skipping server initialization'
        );
      } else {
        console.log('❌ [StoreHydration] No server bookmarks data available');
      }

      // Ensure both stores are marked as hydrated
      cartStore._setHydrated(true);
      bookmarksStore._setHydrated(true);

      console.log('✅ [StoreHydration] Store hydration completed successfully');
    } catch (error) {
      console.error('❌ [StoreHydration] Failed to hydrate stores from server data:', error);

      // Fallback: ensure stores are at least marked as hydrated
      const cartStore = useCartStore.getState();
      const bookmarksStore = useBookmarksStore.getState();

      cartStore._setHydrated(true);
      bookmarksStore._setHydrated(true);

      console.log('🔧 [StoreHydration] Fallback hydration completed');
    }
  }, 0);
}

/**
 * Check if all stores are properly hydrated
 */
export function areStoresHydrated(): boolean {
  if (typeof window === 'undefined') return true; // SSR is always "hydrated"

  try {
    const cartStore = useCartStore.getState();
    const bookmarksStore = useBookmarksStore.getState();

    return cartStore.isHydrated && bookmarksStore.isHydrated;
  } catch (error) {
    return false;
  }
}

/**
 * Force hydration of all stores
 * Use this as a fallback if normal hydration fails
 */
export function forceStoreHydration(): void {
  if (typeof window === 'undefined') return;

  try {
    // Force rehydration from localStorage
    useCartStore.persist.rehydrate();
    useBookmarksStore.persist.rehydrate();

    // Ensure hydration state is set
    const cartStore = useCartStore.getState();
    const bookmarksStore = useBookmarksStore.getState();

    cartStore._setHydrated(true);
    bookmarksStore._setHydrated(true);
  } catch (error) {
    console.warn('Failed to force store hydration:', error);
  }
}

/**
 * Initialize stores with proper error handling
 * This is the main function to call for store initialization
 */
export function initializeStores(serverStorage?: ServerStorageData): boolean {
  if (typeof window === 'undefined') return true;

  try {
    // If server storage is provided, use it for hydration
    if (serverStorage) {
      hydrateStoresFromServer(serverStorage);
    } else {
      // Fallback to localStorage hydration
      forceStoreHydration();
    }

    // Verify hydration was successful
    return areStoresHydrated();
  } catch (error) {
    console.warn('Store initialization failed:', error);

    // Last resort: force hydration
    forceStoreHydration();
    return areStoresHydrated();
  }
}

/**
 * Store hydration status
 */
export interface StoreHydrationStatus {
  cartHydrated: boolean;
  bookmarksHydrated: boolean;
  allHydrated: boolean;
}

/**
 * Get current hydration status of all stores
 */
export function getStoreHydrationStatus(): StoreHydrationStatus {
  if (typeof window === 'undefined') {
    return {
      cartHydrated: true,
      bookmarksHydrated: true,
      allHydrated: true,
    };
  }

  try {
    const cartStore = useCartStore.getState();
    const bookmarksStore = useBookmarksStore.getState();

    const cartHydrated = cartStore.isHydrated;
    const bookmarksHydrated = bookmarksStore.isHydrated;

    return {
      cartHydrated,
      bookmarksHydrated,
      allHydrated: cartHydrated && bookmarksHydrated,
    };
  } catch (error) {
    return {
      cartHydrated: false,
      bookmarksHydrated: false,
      allHydrated: false,
    };
  }
}
