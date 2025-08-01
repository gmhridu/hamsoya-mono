/**
 * Guest Storage Utilities
 * Manages persistent storage for guest users with 30-day expiration
 * Handles cart items, bookmarks, and data migration for authenticated users
 */

import { CartItem, Product } from '@/types';

// Storage configuration
export const GUEST_STORAGE_CONFIG = {
  EXPIRATION_DAYS: 30,
  VERSION: 'v1',
  KEYS: {
    CART: 'hamsoya-guest-cart-v1',
    BOOKMARKS: 'hamsoya-guest-bookmarks-v1',
  },
} as const;

// Data structure interfaces
export interface GuestStorageData<T> {
  data: T;
  timestamp: number;
  expirationDate: number;
  version: string;
}

export interface GuestCartData {
  items: CartItem[];
}

export interface GuestBookmarksData {
  bookmarkedProducts: Product[];
}

/**
 * Calculate expiration timestamp (30 days from now)
 */
function getExpirationTimestamp(): number {
  return Date.now() + (GUEST_STORAGE_CONFIG.EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
}

/**
 * Check if stored data is expired
 */
function isDataExpired(expirationDate: number): boolean {
  return Date.now() > expirationDate;
}

/**
 * Generic function to save guest data to localStorage
 */
function saveGuestData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;

  try {
    const storageData: GuestStorageData<T> = {
      data,
      timestamp: Date.now(),
      expirationDate: getExpirationTimestamp(),
      version: GUEST_STORAGE_CONFIG.VERSION,
    };

    localStorage.setItem(key, JSON.stringify(storageData));
  } catch (error) {
    console.warn('Failed to save guest data to localStorage:', error);
  }
}

/**
 * Generic function to load guest data from localStorage
 */
function loadGuestData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const storageData: GuestStorageData<T> = JSON.parse(stored);

    // Check version compatibility
    if (storageData.version !== GUEST_STORAGE_CONFIG.VERSION) {
      localStorage.removeItem(key);
      return null;
    }

    // Check expiration
    if (isDataExpired(storageData.expirationDate)) {
      localStorage.removeItem(key);
      return null;
    }

    return storageData.data;
  } catch (error) {
    console.warn('Failed to load guest data from localStorage:', error);
    // Remove corrupted data
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Remove guest data from localStorage
 */
function removeGuestData(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove guest data from localStorage:', error);
  }
}

// Guest Cart Storage Functions
export const guestCartStorage = {
  /**
   * Save guest cart data
   */
  save: (cartData: GuestCartData): void => {
    saveGuestData(GUEST_STORAGE_CONFIG.KEYS.CART, cartData);
  },

  /**
   * Load guest cart data
   */
  load: (): GuestCartData | null => {
    return loadGuestData<GuestCartData>(GUEST_STORAGE_CONFIG.KEYS.CART);
  },

  /**
   * Clear guest cart data
   */
  clear: (): void => {
    removeGuestData(GUEST_STORAGE_CONFIG.KEYS.CART);
  },

  /**
   * Check if guest cart data exists and is valid
   */
  exists: (): boolean => {
    return guestCartStorage.load() !== null;
  },
};

// Guest Bookmarks Storage Functions
export const guestBookmarksStorage = {
  /**
   * Save guest bookmarks data
   */
  save: (bookmarksData: GuestBookmarksData): void => {
    saveGuestData(GUEST_STORAGE_CONFIG.KEYS.BOOKMARKS, bookmarksData);
  },

  /**
   * Load guest bookmarks data
   */
  load: (): GuestBookmarksData | null => {
    return loadGuestData<GuestBookmarksData>(GUEST_STORAGE_CONFIG.KEYS.BOOKMARKS);
  },

  /**
   * Clear guest bookmarks data
   */
  clear: (): void => {
    removeGuestData(GUEST_STORAGE_CONFIG.KEYS.BOOKMARKS);
  },

  /**
   * Check if guest bookmarks data exists and is valid
   */
  exists: (): boolean => {
    return guestBookmarksStorage.load() !== null;
  },
};

/**
 * Clean up all expired guest data
 * Should be called on app initialization
 */
export function cleanupExpiredGuestData(): void {
  if (typeof window === 'undefined') return;

  try {
    // Check and clean cart data
    const cartData = guestCartStorage.load();
    if (cartData === null && localStorage.getItem(GUEST_STORAGE_CONFIG.KEYS.CART)) {
      // Data was expired and removed by load function
    }

    // Check and clean bookmarks data
    const bookmarksData = guestBookmarksStorage.load();
    if (bookmarksData === null && localStorage.getItem(GUEST_STORAGE_CONFIG.KEYS.BOOKMARKS)) {
      // Data was expired and removed by load function
    }

    // Clean up any legacy storage keys (for future migrations)
    const keysToCheck = ['hamsoya-guest-cart', 'hamsoya-guest-bookmarks'];
    keysToCheck.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to cleanup expired guest data:', error);
  }
}

/**
 * Clear all guest data (used after successful login and data migration)
 */
export function clearAllGuestData(): void {
  guestCartStorage.clear();
  guestBookmarksStorage.clear();
}

/**
 * Get storage info for debugging
 */
export function getGuestStorageInfo() {
  if (typeof window === 'undefined') {
    return {
      cart: { exists: false, expired: false },
      bookmarks: { exists: false, expired: false },
    };
  }

  const cartRaw = localStorage.getItem(GUEST_STORAGE_CONFIG.KEYS.CART);
  const bookmarksRaw = localStorage.getItem(GUEST_STORAGE_CONFIG.KEYS.BOOKMARKS);

  const getInfo = (raw: string | null) => {
    if (!raw) return { exists: false, expired: false };
    
    try {
      const data = JSON.parse(raw);
      return {
        exists: true,
        expired: isDataExpired(data.expirationDate),
        timestamp: data.timestamp,
        expirationDate: data.expirationDate,
      };
    } catch {
      return { exists: true, expired: true };
    }
  };

  return {
    cart: getInfo(cartRaw),
    bookmarks: getInfo(bookmarksRaw),
  };
}
