/**
 * Server-Side Storage Middleware
 * Pre-caches storage data for instant availability
 * Eliminates client-side loading states and flicker
 */

import { NextRequest, NextResponse } from 'next/server';
import { ENHANCED_STORAGE_CONFIG } from './enhanced-guest-storage';

/**
 * Parse stored data from cookie string (middleware version)
 */
function parseStoredDataMiddleware<T>(cookieValue: string | undefined, defaultData: T): T {
  if (!cookieValue) return defaultData;

  try {
    const decoded = decodeURIComponent(cookieValue);
    const parsed = JSON.parse(decoded);
    
    // Validate expiration
    if (parsed.expirationDate && Date.now() > parsed.expirationDate) {
      return defaultData;
    }
    
    return parsed.data || defaultData;
  } catch (error) {
    return defaultData;
  }
}

/**
 * Pre-cache storage data in middleware
 * This ensures data is available before any component renders
 */
export function preloadStorageData(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  try {
    // Get storage data from cookies
    const cartCookie = request.cookies.get(ENHANCED_STORAGE_CONFIG.KEYS.CART)?.value;
    const bookmarksCookie = request.cookies.get(ENHANCED_STORAGE_CONFIG.KEYS.BOOKMARKS)?.value;

    // Parse cart data
    const cartData = parseStoredDataMiddleware(cartCookie, { items: [] });
    const totalItems = cartData.items?.reduce(
      (sum: number, item: any) => sum + (item.quantity || 0),
      0
    ) || 0;

    // Parse bookmarks data
    const bookmarksData = parseStoredDataMiddleware(bookmarksCookie, { bookmarkedProducts: [] });
    const bookmarkCount = bookmarksData.bookmarkedProducts?.length || 0;

    // Set headers with pre-computed data for instant access
    response.headers.set('X-Cart-Items', totalItems.toString());
    response.headers.set('X-Bookmark-Count', bookmarkCount.toString());
    response.headers.set('X-Storage-Preloaded', 'true');

    // Set cache headers for better performance
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

  } catch (error) {
    // If parsing fails, set default values
    response.headers.set('X-Cart-Items', '0');
    response.headers.set('X-Bookmark-Count', '0');
    response.headers.set('X-Storage-Preloaded', 'false');
  }

  return response;
}

/**
 * Check if storage data should be preloaded for this route
 */
export function shouldPreloadStorage(pathname: string): boolean {
  // Preload storage data for all pages except API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    pathname.startsWith('/static/')
  ) {
    return false;
  }

  return true;
}

/**
 * Enhanced middleware function that includes storage preloading
 */
export function enhanceMiddlewareWithStorage(
  request: NextRequest,
  baseResponse: NextResponse
): NextResponse {
  const { pathname } = request.nextUrl;

  // Only preload storage for relevant routes
  if (!shouldPreloadStorage(pathname)) {
    return baseResponse;
  }

  // Enhance the response with storage preloading
  return preloadStorageData(request);
}
