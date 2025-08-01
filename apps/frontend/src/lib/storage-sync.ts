/**
 * Simplified Storage Synchronization System
 * Ensures guest cart/bookmarks persist across page reloads with immediate availability
 */

'use client';

import { CartItem, Product } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  CART: 'hamsoya-cart-v3',
  BOOKMARKS: 'hamsoya-bookmarks-v3',
} as const;

// Data interfaces
export interface StorageCartData {
  items: CartItem[];
  timestamp: number;
}

export interface StorageBookmarksData {
  bookmarkedProducts: Product[];
  timestamp: number;
}

/**
 * Safe localStorage operations with error handling
 */
class SafeStorage {
  static get(key: string): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to read from localStorage (${key}):`, error);
      return null;
    }
  }

  static set(key: string, value: string): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Failed to write to localStorage (${key}):`, error);
      return false;
    }
  }

  static remove(key: string): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove from localStorage (${key}):`, error);
      return false;
    }
  }
}

/**
 * Cart storage operations
 */
export const cartStorage = {
  save: (items: CartItem[]): void => {
    const data: StorageCartData = {
      items,
      timestamp: Date.now(),
    };
    SafeStorage.set(STORAGE_KEYS.CART, JSON.stringify(data));
  },

  load: (): CartItem[] => {
    const stored = SafeStorage.get(STORAGE_KEYS.CART);
    if (!stored) return [];

    try {
      const data: StorageCartData = JSON.parse(stored);
      return data.items || [];
    } catch (error) {
      console.warn('Failed to parse cart data:', error);
      return [];
    }
  },

  clear: (): void => {
    SafeStorage.remove(STORAGE_KEYS.CART);
  },
};

/**
 * Bookmarks storage operations
 */
export const bookmarksStorage = {
  save: (bookmarkedProducts: Product[]): void => {
    const data: StorageBookmarksData = {
      bookmarkedProducts,
      timestamp: Date.now(),
    };
    SafeStorage.set(STORAGE_KEYS.BOOKMARKS, JSON.stringify(data));
  },

  load: (): Product[] => {
    const stored = SafeStorage.get(STORAGE_KEYS.BOOKMARKS);
    if (!stored) return [];

    try {
      const data: StorageBookmarksData = JSON.parse(stored);
      return data.bookmarkedProducts || [];
    } catch (error) {
      console.warn('Failed to parse bookmarks data:', error);
      return [];
    }
  },

  clear: (): void => {
    SafeStorage.remove(STORAGE_KEYS.BOOKMARKS);
  },
};

/**
 * Initialize storage system and clean up old data
 */
export function initializeStorage(): void {
  if (typeof window === 'undefined') return;

  // Clean up old storage keys
  const oldKeys = [
    'hamsoya-cart',
    'hamsoya-bookmarks',
    'hamsoya-cart-v2',
    'hamsoya-bookmarks-v2',
    'hamsoya-guest-cart-v1',
    'hamsoya-guest-bookmarks-v1',
  ];

  oldKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Get all storage data for server-side hydration
 */
export function getAllStorageData() {
  return {
    cart: cartStorage.load(),
    bookmarks: bookmarksStorage.load(),
  };
}

/**
 * Clear all storage data (for logout)
 */
export function clearAllStorageData(): void {
  cartStorage.clear();
  bookmarksStorage.clear();
}
