/**
 * Enhanced Server-Side Storage Cache for Instant Data Availability
 * Fetches cart and bookmark data from Redis backend with cookie fallback
 * Provides immediate data access with zero loading states
 */

import { CartItem, Product } from '@/types';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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
 * Parse stored data with fallback
 */
function parseStoredData<T>(data: string, fallback: T, key: string): T {
  try {
    const parsed = JSON.parse(data);
    return parsed || fallback;
  } catch (error) {
    console.warn(`Failed to parse ${key} data:`, error);
    return fallback;
  }
}

/**
 * Get session ID from cookies
 */
async function getSessionId(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('session_id')?.value;
  } catch (error) {
    console.warn('Failed to get session ID:', error);
    return undefined;
  }
}

/**
 * Fetch cart data from backend with cookie fallback
 */
async function fetchCartData(): Promise<ServerCartData> {
  const defaultCart: ServerCartData = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  };

  try {
    const sessionId = await getSessionId();

    if (!sessionId) {
      // Try to get count from cookie
      const cookieStore = await cookies();
      const cartCount = parseInt(cookieStore.get('cart_count')?.value || '0', 10);
      return {
        ...defaultCart,
        totalItems: cartCount,
      };
    }

    // Try to fetch from backend using GET for tRPC query with timeout
    const inputData = { sessionId };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const response = await fetch(
      `${BACKEND_URL}/trpc/cart.get?input=${encodeURIComponent(JSON.stringify(inputData))}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      const data = await response.json();
      if (data.result?.data?.data) {
        return data.result.data.data;
      }
    }

    // Fallback to cookie data
    const cookieStore = await cookies();
    const cartCount = parseInt(cookieStore.get('cart_count')?.value || '0', 10);

    // Try to get cart items from cookie (legacy support)
    const cartCookie = cookieStore.get('hamsoya-cart-v2')?.value;
    if (cartCookie) {
      const cartData = parseStoredData(cartCookie, { items: [] }, 'cart');
      const totalItems =
        cartData.items?.reduce((sum: number, item: CartItem) => sum + item.quantity, 0) || 0;
      const totalPrice =
        cartData.items?.reduce(
          (sum: number, item: CartItem) => sum + item.product.price * item.quantity,
          0
        ) || 0;

      return {
        items: cartData.items || [],
        totalItems,
        totalPrice,
      };
    }

    return {
      ...defaultCart,
      totalItems: cartCount,
    };
  } catch (error) {
    console.warn('Failed to fetch cart data:', error);

    // Final fallback to cookie count
    try {
      const cookieStore = await cookies();
      const cartCount = parseInt(cookieStore.get('cart_count')?.value || '0', 10);
      return {
        ...defaultCart,
        totalItems: cartCount,
      };
    } catch {
      return defaultCart;
    }
  }
}

/**
 * Fetch bookmark data from backend with cookie fallback
 */
async function fetchBookmarkData(): Promise<ServerBookmarksData> {
  const defaultBookmarks: ServerBookmarksData = {
    bookmarkedProducts: [],
    bookmarkCount: 0,
  };

  try {
    const sessionId = await getSessionId();

    if (!sessionId) {
      // Try to get count from cookie
      const cookieStore = await cookies();
      const bookmarkCount = parseInt(cookieStore.get('bookmark_count')?.value || '0', 10);
      return {
        ...defaultBookmarks,
        bookmarkCount,
      };
    }

    // Try to fetch from backend using GET for tRPC query with timeout
    const inputData = { sessionId };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const response = await fetch(
      `${BACKEND_URL}/trpc/bookmarks.get?input=${encodeURIComponent(JSON.stringify(inputData))}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeoutId));

    if (response.ok) {
      const data = await response.json();
      if (data.result?.data?.data) {
        return data.result.data.data;
      }
    }

    // Fallback to cookie data
    const cookieStore = await cookies();
    const bookmarkCount = parseInt(cookieStore.get('bookmark_count')?.value || '0', 10);

    // Try to get bookmark items from cookie (legacy support)
    const bookmarkCookie = cookieStore.get('hamsoya-bookmarks-v2')?.value;
    if (bookmarkCookie) {
      const bookmarkData = parseStoredData(bookmarkCookie, { bookmarkedProducts: [] }, 'bookmarks');

      return {
        bookmarkedProducts: bookmarkData.bookmarkedProducts || [],
        bookmarkCount: bookmarkData.bookmarkedProducts?.length || 0,
      };
    }

    return {
      ...defaultBookmarks,
      bookmarkCount,
    };
  } catch (error) {
    console.warn('Failed to fetch bookmark data:', error);

    // Final fallback to cookie count
    try {
      const cookieStore = await cookies();
      const bookmarkCount = parseInt(cookieStore.get('bookmark_count')?.value || '0', 10);
      return {
        ...defaultBookmarks,
        bookmarkCount,
      };
    } catch {
      return defaultBookmarks;
    }
  }
}

/**
 * Get server-side storage data
 * This function fetches cart and bookmark data from Redis backend with cookie fallback
 */
export async function getServerStorageData(): Promise<ServerStorageData> {
  try {
    // Fetch cart and bookmark data in parallel
    const [cart, bookmarks] = await Promise.all([fetchCartData(), fetchBookmarkData()]);

    return {
      cart,
      bookmarks,
      isHydrated: true,
    };
  } catch (error) {
    console.error('Failed to get server storage data:', error);

    // Return empty data as fallback
    return {
      cart: {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      },
      bookmarks: {
        bookmarkedProducts: [],
        bookmarkCount: 0,
      },
      isHydrated: true,
    };
  }
}

/**
 * Get cart count only (for performance)
 */
export async function getServerCartCount(): Promise<number> {
  try {
    const cookieStore = await cookies();
    return parseInt(cookieStore.get('cart_count')?.value || '0', 10);
  } catch {
    return 0;
  }
}

/**
 * Get bookmark count only (for performance)
 */
export async function getServerBookmarkCount(): Promise<number> {
  try {
    const cookieStore = await cookies();
    return parseInt(cookieStore.get('bookmark_count')?.value || '0', 10);
  } catch {
    return 0;
  }
}
