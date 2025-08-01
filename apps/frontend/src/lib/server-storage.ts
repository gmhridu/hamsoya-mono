import { CartItem, Product } from '@/types';
import { GetServerSidePropsContext } from 'next';
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
 * Parse stored data with expiration check
 */
function parseStoredData<T>(stored: string | undefined, defaultData: T): T {
  if (!stored) return defaultData;

  try {
    const storageData = JSON.parse(stored);

    // Check version compatibility
    if (storageData.version !== ENHANCED_STORAGE_CONFIG.VERSION) {
      return defaultData;
    }

    // Check expiration
    if (Date.now() > storageData.expirationDate) {
      return defaultData;
    }

    return storageData.data;
  } catch (error) {
    return defaultData;
  }
}

/**
 * Get cart data from cookies (server-side localStorage equivalent)
 */
function getServerCartData(context: GetServerSidePropsContext): ServerCartData {
  try {
    const cartCookie = context.req.cookies[ENHANCED_STORAGE_CONFIG.KEYS.CART];
    const cartData = parseStoredData(cartCookie, { items: [] });

    const totalItems = cartData.items.reduce(
      (sum: number, item: CartItem) => sum + item.quantity,
      0
    );
    const totalPrice = cartData.items.reduce(
      (sum: number, item: CartItem) => sum + item.product.price * item.quantity,
      0
    );

    return {
      items: cartData.items || [],
      totalItems,
      totalPrice,
    };
  } catch (error) {
    // Return empty cart data if parsing fails
    return {
      items: [],
      totalItems: 0,
      totalPrice: 0,
    };
  }
}

/**
 * Get bookmarks data from cookies (server-side localStorage equivalent)
 */
function getServerBookmarksData(context: GetServerSidePropsContext): ServerBookmarksData {
  try {
    const bookmarksCookie = context.req.cookies[ENHANCED_STORAGE_CONFIG.KEYS.BOOKMARKS];
    const bookmarksData = parseStoredData(bookmarksCookie, { bookmarkedProducts: [] });

    return {
      bookmarkedProducts: bookmarksData.bookmarkedProducts || [],
      bookmarkCount: (bookmarksData.bookmarkedProducts || []).length,
    };
  } catch (error) {
    // Return empty bookmarks data if parsing fails
    return {
      bookmarkedProducts: [],
      bookmarkCount: 0,
    };
  }
}

/**
 * Get all server-side storage data
 * Use in getServerSideProps to pre-populate client state
 */
export function getServerStorageData(context: GetServerSidePropsContext): ServerStorageData {
  return {
    cart: getServerCartData(context),
    bookmarks: getServerBookmarksData(context),
    isHydrated: true,
  };
}

/**
 * Create props with server-side storage data
 * Eliminates client-side hydration delays
 */
export function withServerStorage<T extends Record<string, any>>(
  context: GetServerSidePropsContext,
  additionalProps: T = {} as T
) {
  const storageData = getServerStorageData(context);

  return {
    props: {
      ...additionalProps,
      serverStorage: storageData,
    },
  };
}

/**
 * Server-side storage synchronization
 * Keeps cookies in sync with localStorage for server-side reading
 */
export function createStorageSyncScript(): string {
  return `
    (function() {
      // Sync localStorage to cookies for server-side reading
      function syncStorageToServer() {
        try {
          const cartData = localStorage.getItem('${ENHANCED_STORAGE_CONFIG.KEYS.CART}');
          const bookmarksData = localStorage.getItem('${ENHANCED_STORAGE_CONFIG.KEYS.BOOKMARKS}');

          if (cartData) {
            document.cookie = '${ENHANCED_STORAGE_CONFIG.KEYS.CART}=' + encodeURIComponent(cartData) + '; path=/; max-age=' + (30 * 24 * 60 * 60);
          }

          if (bookmarksData) {
            document.cookie = '${ENHANCED_STORAGE_CONFIG.KEYS.BOOKMARKS}=' + encodeURIComponent(bookmarksData) + '; path=/; max-age=' + (30 * 24 * 60 * 60);
          }
        } catch (error) {
          console.warn('Failed to sync storage to server:', error);
        }
      }

      // Sync on page load
      syncStorageToServer();

      // Sync on storage changes
      window.addEventListener('storage', syncStorageToServer);

      // Sync on beforeunload to catch any last-minute changes
      window.addEventListener('beforeunload', syncStorageToServer);
    })();
  `;
}

/**
 * Enhanced storage middleware for Next.js
 * Automatically syncs localStorage to cookies
 */
export function createStorageMiddleware() {
  return `
    <script>
      ${createStorageSyncScript()}
    </script>
  `;
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
