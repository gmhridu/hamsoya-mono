/**
 * Enhanced Guest Storage with Immediate Hydration
 * Fixes hydration timing issues and localStorage synchronization
 */

import { CartItem, Product } from '@/types';

// Storage configuration
export const ENHANCED_STORAGE_CONFIG = {
  EXPIRATION_DAYS: 30,
  VERSION: 'v2',
  KEYS: {
    CART: 'hamsoya-cart-v2',
    BOOKMARKS: 'hamsoya-bookmarks-v2',
  },
} as const;

// Data structure interfaces
export interface EnhancedStorageData<T> {
  data: T;
  timestamp: number;
  expirationDate: number;
  version: string;
}

export interface CartData {
  items: CartItem[];
}

export interface BookmarksData {
  bookmarkedProducts: Product[];
}

/**
 * Calculate expiration timestamp (30 days from now)
 */
function getExpirationTimestamp(): number {
  return Date.now() + (ENHANCED_STORAGE_CONFIG.EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * Check if stored data is expired
 */
function isDataExpired(expirationDate: number): boolean {
  return Date.now() > expirationDate;
}

/**
 * Enhanced storage class with immediate hydration
 */
class EnhancedStorage<T> {
  private key: string;
  private defaultData: T;

  constructor(key: string, defaultData: T) {
    this.key = key;
    this.defaultData = defaultData;
  }

  /**
   * Save data to localStorage with expiration
   */
  save(data: T): void {
    if (typeof window === 'undefined') return;

    try {
      const storageData: EnhancedStorageData<T> = {
        data,
        timestamp: Date.now(),
        expirationDate: getExpirationTimestamp(),
        version: ENHANCED_STORAGE_CONFIG.VERSION,
      };

      localStorage.setItem(this.key, JSON.stringify(storageData));
    } catch (error) {
      console.warn(`Failed to save data to localStorage (${this.key}):`, error);
    }
  }

  /**
   * Load data from localStorage with expiration check
   */
  load(): T {
    if (typeof window === 'undefined') return this.defaultData;

    try {
      const stored = localStorage.getItem(this.key);
      if (!stored) return this.defaultData;

      const storageData: EnhancedStorageData<T> = JSON.parse(stored);

      // Check version compatibility
      if (storageData.version !== ENHANCED_STORAGE_CONFIG.VERSION) {
        localStorage.removeItem(this.key);
        return this.defaultData;
      }

      // Check expiration
      if (isDataExpired(storageData.expirationDate)) {
        localStorage.removeItem(this.key);
        return this.defaultData;
      }

      return storageData.data;
    } catch (error) {
      console.warn(`Failed to load data from localStorage (${this.key}):`, error);
      // Remove corrupted data
      localStorage.removeItem(this.key);
      return this.defaultData;
    }
  }

  /**
   * Clear data from localStorage
   */
  clear(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.warn(`Failed to clear data from localStorage (${this.key}):`, error);
    }
  }

  /**
   * Check if data exists and is valid
   */
  exists(): boolean {
    const data = this.load();
    return JSON.stringify(data) !== JSON.stringify(this.defaultData);
  }
}

// Create storage instances
export const enhancedCartStorage = new EnhancedStorage<CartData>(
  ENHANCED_STORAGE_CONFIG.KEYS.CART,
  { items: [] }
);

export const enhancedBookmarksStorage = new EnhancedStorage<BookmarksData>(
  ENHANCED_STORAGE_CONFIG.KEYS.BOOKMARKS,
  { bookmarkedProducts: [] }
);

/**
 * Custom Zustand storage that uses enhanced localStorage
 */
export function createEnhancedStorage<T>(storageInstance: EnhancedStorage<T>) {
  return {
    getItem: (name: string): T | null => {
      return storageInstance.load();
    },
    setItem: (name: string, value: T): void => {
      storageInstance.save(value);
    },
    removeItem: (name: string): void => {
      storageInstance.clear();
    },
  };
}

/**
 * Clean up all expired data
 */
export function cleanupExpiredData(): void {
  if (typeof window === 'undefined') return;

  try {
    // Force load to trigger cleanup of expired data
    enhancedCartStorage.load();
    enhancedBookmarksStorage.load();

    // Clean up legacy storage keys
    const legacyKeys = [
      'hamsoya-cart',
      'hamsoya-bookmarks',
      'hamsoya-guest-cart-v1',
      'hamsoya-guest-bookmarks-v1',
    ];
    
    legacyKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to cleanup expired data:', error);
  }
}

/**
 * Initialize storage on app startup
 */
export function initializeEnhancedStorage(): void {
  if (typeof window === 'undefined') return;

  // Clean up expired data first
  cleanupExpiredData();
}

/**
 * Get storage info for debugging
 */
export function getStorageInfo() {
  if (typeof window === 'undefined') {
    return {
      cart: { exists: false, itemCount: 0 },
      bookmarks: { exists: false, itemCount: 0 },
    };
  }

  const cartData = enhancedCartStorage.load();
  const bookmarksData = enhancedBookmarksStorage.load();

  return {
    cart: {
      exists: enhancedCartStorage.exists(),
      itemCount: cartData.items.length,
      totalItems: cartData.items.reduce((sum, item) => sum + item.quantity, 0),
    },
    bookmarks: {
      exists: enhancedBookmarksStorage.exists(),
      itemCount: bookmarksData.bookmarkedProducts.length,
    },
  };
}
