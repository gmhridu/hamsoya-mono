/**
 * Next.js Middleware for Instant Server-Side Authentication
 * Provides ChatGPT-style instant navigation with zero loading states
 * Handles all authentication redirects before any content renders
 */

import { enhanceMiddlewareWithStorage } from '@/lib/server-storage-middleware';
import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication - instant redirect to login if not authenticated
const PROTECTED_ROUTES = ['/order', '/profile', '/dashboard', '/checkout', '/bookmarks'];

// Routes that should redirect authenticated users - instant redirect to home if authenticated
const GUEST_ONLY_ROUTES = ['/login', '/register', '/forgot-password', '/signup'];

// Public routes that don't require authentication checks
const PUBLIC_ROUTES = ['/', '/products', '/about', '/contact'];

/**
 * Check if user is authenticated by examining cookies
 * This provides instant authentication state without API calls
 */
function isAuthenticated(request: NextRequest): boolean {
  const accessToken = request.cookies.get('accessToken');
  const refreshToken = request.cookies.get('refreshToken');

  // User is considered authenticated if they have valid tokens
  // This eliminates the need for API calls in middleware
  return !!(accessToken?.value && refreshToken?.value);
}

/**
 * Get redirect URL from query parameters
 */
function getRedirectUrl(request: NextRequest): string | null {
  const url = new URL(request.url);
  return url.searchParams.get('redirect');
}

/**
 * Create instant redirect response with optimized headers
 * Ensures immediate navigation without caching issues
 */
function createInstantRedirect(url: string, request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL(url, request.url), 307); // Temporary redirect

  // Headers for instant navigation and no caching
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');

  return response;
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = isAuthenticated(request);

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    pathname.startsWith('/static/')
  ) {
    return NextResponse.next();
  }

  // Handle protected routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!authenticated) {
      // Redirect to login with return URL
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      return createInstantRedirect(loginUrl, request);
    }
    // User is authenticated, allow access
    return NextResponse.next();
  }

  // Handle guest-only routes (login, register, etc.)
  if (GUEST_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
    if (authenticated) {
      // Check if there's a redirect URL from login flow
      const redirectUrl = getRedirectUrl(request);
      const destination = redirectUrl || '/';
      return createInstantRedirect(destination, request);
    }
    // User is not authenticated, allow access to guest routes
    return NextResponse.next();
  }

  // Handle public routes - no authentication required
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route)) || pathname === '/') {
    // Enhance response with storage preloading for better performance
    return enhanceMiddlewareWithStorage(request, NextResponse.next());
  }

  // Default: allow access to other routes with storage preloading
  return enhanceMiddlewareWithStorage(request, NextResponse.next());
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|static).*)',
  ],
};
