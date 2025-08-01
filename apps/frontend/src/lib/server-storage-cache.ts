/**
 * Server-Side Storage Cache for Instant Data Availability
 * Eliminates client-side useEffect hooks and provides immediate data access
 */

import { CartItem, Product } from '@/types';
import { cookies } from 'next/headers';
import { ENHANCED_STORAGE_CONFIG } from './enhanced-guest-storage';

// Server-side storage data interfaces
export interface ServerCartData {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface ServerBookmarksData {
  bookmarkedProducts: Product[];
  bookmarkCount: number;
}

export interface ServerStorageData {
  cart: ServerCartData;
  bookmarks: ServerBookmarksData;
  isHydrated: true;
}

/**
 * Parse stored data from cookie string
 * Handles multiple storage formats including Zustand persist format
 */
function parseStoredData<T>(cookieValue: string | undefined, defaultData: T, keyName?: string): T {
  if (!cookieValue) {
    console.log(`🔍 [ServerStorage] No cookie value for ${keyName || 'unknown key'}`);
    return defaultData;
  }

  try {
    const decoded = decodeURIComponent(cookieValue);
    console.log(
      `🔍 [ServerStorage] Parsing cookie for ${keyName || 'unknown key'}:`,
      decoded.substring(0, 200) + '...'
    );

    const parsed = JSON.parse(decoded);

    // Handle Zustand persist format: {state: {items: [...], bookmarkedProducts: [...]}, version: 0}
    if (parsed.state && typeof parsed.state === 'object') {
      console.log(`📦 [ServerStorage] Found Zustand persist format for ${keyName}`);

      // For cart data
      if (parsed.state.items) {
        console.log(`🛒 [ServerStorage] Found ${parsed.state.items.length} cart items`);
        return { items: parsed.state.items } as T;
      }

      // For bookmarks data
      if (parsed.state.bookmarkedProducts) {
        console.log(
          `🔖 [ServerStorage] Found ${parsed.state.bookmarkedProducts.length} bookmarked products`
        );
        return { bookmarkedProducts: parsed.state.bookmarkedProducts } as T;
      }

      return parsed.state as T;
    }

    // Handle enhanced storage format (with expiration)
    if (parsed.data && parsed.expirationDate) {
      console.log(`📅 [ServerStorage] Found enhanced storage format for ${keyName}`);
      // Validate expiration
      if (Date.now() > parsed.expirationDate) {
        console.log(`⏰ [ServerStorage] Data expired for ${keyName}`);
        return defaultData;
      }
      return parsed.data || defaultData;
    }

    // Handle simple storage format (direct data)
    if (parsed.items || parsed.bookmarkedProducts) {
      console.log(`📋 [ServerStorage] Found simple storage format for ${keyName}`);
      return parsed;
    }

    // Handle timestamp-based format
    if (parsed.timestamp) {
      console.log(`⏱️ [ServerStorage] Found timestamp-based format for ${keyName}`);
      if (parsed.items) {
        return { items: parsed.items } as T;
      }
      if (parsed.bookmarkedProducts) {
        return { bookmarkedProducts: parsed.bookmarkedProducts } as T;
      }
      return defaultData;
    }

    console.log(`❓ [ServerStorage] Unknown format for ${keyName}, using as-is`);
    return parsed || defaultData;
  } catch (error) {
    console.error(`❌ [ServerStorage] Failed to parse cookie for ${keyName}:`, error);
    return defaultData;
  }
}

/**
 * Get cart data from cookies (server-side)
 */
async function getServerCartData(): Promise<ServerCartData> {
  console.log('🛒 [ServerStorage] Getting cart data from cookies...');

  try {
    const cookieStore = await cookies();

    // Try multiple possible keys for cart data
    const possibleKeys = ['hamsoya-cart-v2', ENHANCED_STORAGE_CONFIG.KEYS.CART, 'hamsoya-cart-v3'];
    let cartData = { items: [] };
    let foundKey = null;

    for (const key of possibleKeys) {
      const cartCookie = cookieStore.get(key)?.value;
      if (cartCookie) {
        console.log(`🔑 [ServerStorage] Found cart cookie with key: ${key}`);
        cartData = parseStoredData(cartCookie, { items: [] }, key);
        foundKey = key;
        break;
      }
    }

    if (!foundKey) {
      console.log('❌ [ServerStorage] No cart cookie found with any key');
    }

    const totalItems = cartData.items.reduce(
      (sum: number, item: CartItem) => sum + item.quantity,
      0
    );
    const totalPrice = cartData.items.reduce(
      (sum: number, item: CartItem) => sum + item.product.price * item.quantity,
      0
    );

    console.log(
      `📊 [ServerStorage] Cart summary: ${totalItems} items, $${totalPrice.toFixed(2)} total`
    );

    return {
      items: cartData.items || [],
      totalItems,
      totalPrice,
    };
  } catch (error) {
    console.error('❌ [ServerStorage] Error getting cart data:', error);
    return {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    };
  }
}

/**
 * Get bookmarks data from cookies (server-side)
 */
async function getServerBookmarksData(): Promise<ServerBookmarksData> {
  console.log('🔖 [ServerStorage] Getting bookmarks data from cookies...');

  try {
    const cookieStore = await cookies();

    // Try multiple possible keys for bookmarks data
    const possibleKeys = [
      'hamsoya-bookmarks-v2',
      ENHANCED_STORAGE_CONFIG.KEYS.BOOKMARKS,
      'hamsoya-bookmarks-v3',
    ];
    let bookmarksData = { bookmarkedProducts: [] };
    let foundKey = null;

    for (const key of possibleKeys) {
      const bookmarksCookie = cookieStore.get(key)?.value;
      if (bookmarksCookie) {
        console.log(`🔑 [ServerStorage] Found bookmarks cookie with key: ${key}`);
        bookmarksData = parseStoredData(bookmarksCookie, { bookmarkedProducts: [] }, key);
        foundKey = key;
        break;
      }
    }

    if (!foundKey) {
      console.log('❌ [ServerStorage] No bookmarks cookie found with any key');
    }

    const bookmarkCount = (bookmarksData.bookmarkedProducts || []).length;
    console.log(`📊 [ServerStorage] Bookmarks summary: ${bookmarkCount} bookmarked products`);

    return {
      bookmarkedProducts: bookmarksData.bookmarkedProducts || [],
      bookmarkCount,
    };
  } catch (error) {
    console.error('❌ [ServerStorage] Error getting bookmarks data:', error);
    return {
      bookmarkedProducts: [],
      bookmarkCount: 0,
    };
  }
}

/**
 * Get all server-side storage data
 * Async function to handle Next.js 15 cookies API
 */
export async function getServerStorageData(): Promise<ServerStorageData> {
  console.log('🔄 [ServerStorage] Getting all server storage data...');

  const [cart, bookmarks] = await Promise.all([getServerCartData(), getServerBookmarksData()]);

  console.log('📊 [ServerStorage] Final server storage summary:');
  console.log(`  Cart: ${cart.items.length} items, ${cart.totalItems} total quantity`);
  console.log(`  Bookmarks: ${bookmarks.bookmarkedProducts.length} products`);

  return {
    cart,
    bookmarks,
    isHydrated: true,
  };
}

/**
 * Server-side cart utilities
 */
export class ServerCart {
  private data: ServerCartData;

  constructor(data: ServerCartData) {
    this.data = data;
  }

  get items() {
    return this.data.items;
  }
  get totalItems() {
    return this.data.totalItems;
  }
  get totalPrice() {
    return this.data.totalPrice;
  }
  get isEmpty() {
    return this.data.items.length === 0;
  }

  isInCart(productId: string): boolean {
    return this.data.items.some(item => item.product.id === productId);
  }

  getItemQuantity(productId: string): number {
    const item = this.data.items.find(item => item.product.id === productId);
    return item?.quantity || 0;
  }
}

/**
 * Server-side bookmarks utilities
 */
export class ServerBookmarks {
  private data: ServerBookmarksData;

  constructor(data: ServerBookmarksData) {
    this.data = data;
  }

  get bookmarkedProducts() {
    return this.data.bookmarkedProducts;
  }
  get bookmarkCount() {
    return this.data.bookmarkCount;
  }
  get isEmpty() {
    return this.data.bookmarkedProducts.length === 0;
  }

  isBookmarked(productId: string): boolean {
    return this.data.bookmarkedProducts.some(product => product.id === productId);
  }
}

/**
 * Create server-side storage instances
 */
export function createServerStorageInstances(data: ServerStorageData) {
  return {
    cart: new ServerCart(data.cart),
    bookmarks: new ServerBookmarks(data.bookmarks),
  };
}
