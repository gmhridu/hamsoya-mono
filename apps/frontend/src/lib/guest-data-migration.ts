/**
 * Guest Data Migration Utilities
 * Handles migration of guest cart and bookmarks to authenticated user accounts
 */

import { useBookmarksStore } from '@/store/bookmarks-store';
import { useCartStore } from '@/store/cart-store';

/**
 * Migration result interface
 */
export interface MigrationResult {
  cartMigrated: boolean;
  bookmarksMigrated: boolean;
  cartItemsAdded: number;
  bookmarksAdded: number;
}

/**
 * Migrate guest cart and bookmarks to authenticated user account
 * This should be called after successful login
 */
export async function migrateGuestDataToUser(): Promise<MigrationResult> {
  const result: MigrationResult = {
    cartMigrated: false,
    bookmarksMigrated: false,
    cartItemsAdded: 0,
    bookmarksAdded: 0,
  };

  try {
    // Clean up any expired data first
    cleanupExpiredData();

    // Get store instances
    const cartStore = useCartStore.getState();
    const bookmarksStore = useBookmarksStore.getState();

    // Migrate cart data
    const currentCartItems = cartStore.items;
    const migratedCartItems = cartStore.migrateGuestCart(currentCartItems);

    if (migratedCartItems.length > currentCartItems.length) {
      // Update cart with migrated items
      cartStore.clearCart();
      migratedCartItems.forEach(item => {
        cartStore.addItem(item.product, item.quantity);
      });

      result.cartMigrated = true;
      result.cartItemsAdded = migratedCartItems.length - currentCartItems.length;
    }

    // Migrate bookmarks data
    const currentBookmarks = bookmarksStore.bookmarkedProducts;
    const migratedBookmarks = bookmarksStore.migrateGuestBookmarks(currentBookmarks);

    if (migratedBookmarks.length > currentBookmarks.length) {
      // Update bookmarks with migrated items
      bookmarksStore.clearBookmarks();
      migratedBookmarks.forEach(bookmark => {
        bookmarksStore.addBookmark(bookmark);
      });

      result.bookmarksMigrated = true;
      result.bookmarksAdded = migratedBookmarks.length - currentBookmarks.length;
    }

    // Clear all guest data after successful migration
    cartStore.clearGuestData();
    bookmarksStore.clearGuestData();

    return result;
  } catch (error) {
    console.warn('Failed to migrate guest data:', error);
    return result;
  }
}

/**
 * Initialize guest data on app startup
 * Loads guest cart and bookmarks if user is not authenticated
 */
export function initializeGuestData(): void {
  try {
    // Initialize enhanced storage system
    initializeEnhancedStorage();
  } catch (error) {
    console.warn('Failed to initialize guest data:', error);
  }
}

/**
 * Save current cart and bookmarks as guest data
 * This should be called when user logs out
 */
export function saveAsGuestData(): void {
  try {
    // Data is automatically saved by the enhanced storage system
    // This function is kept for compatibility
  } catch (error) {
    console.warn('Failed to save guest data:', error);
  }
}

/**
 * Clear all guest data
 * This should be called after successful data migration or when no longer needed
 */
export function clearGuestData(): void {
  try {
    const cartStore = useCartStore.getState();
    const bookmarksStore = useBookmarksStore.getState();

    cartStore.clearGuestData();
    bookmarksStore.clearGuestData();
  } catch (error) {
    console.warn('Failed to clear guest data:', error);
  }
}

/**
 * Check if guest data exists
 */
export function hasGuestData(): boolean {
  try {
    const cartStore = useCartStore.getState();
    const bookmarksStore = useBookmarksStore.getState();

    // Check if guest storage has data (without loading it)
    return cartStore.items.length > 0 || bookmarksStore.bookmarkedProducts.length > 0;
  } catch (error) {
    console.warn('Failed to check guest data:', error);
    return false;
  }
}

/**
 * Get guest data summary for debugging
 */
export function getGuestDataSummary() {
  try {
    const cartStore = useCartStore.getState();
    const bookmarksStore = useBookmarksStore.getState();

    return {
      cartItems: cartStore.items.length,
      bookmarks: bookmarksStore.bookmarkedProducts.length,
      totalCartValue: cartStore.getTotalPrice(),
    };
  } catch (error) {
    console.warn('Failed to get guest data summary:', error);
    return {
      cartItems: 0,
      bookmarks: 0,
      totalCartValue: 0,
    };
  }
}
