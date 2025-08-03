/**
 * Next.js Middleware for Instant Server-Side Authentication
 * Provides ChatGPT-style instant navigation with zero loading states
 * Handles all authentication redirects before any content renders
 * Enhanced with automatic token refresh for seamless user experience
 */

import { enhanceMiddlewareWithStorage } from '@/lib/server-storage-middleware';
import { checkAuthenticationWithRefresh } from '@/lib/server-token-validator';
import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication - instant redirect to login if not authenticated
const PROTECTED_ROUTES = ['/order', '/profile', '/dashboard', '/checkout', '/bookmarks', '/admin'];

// Routes that should redirect authenticated users - instant redirect to home if authenticated
const GUEST_ONLY_ROUTES = ['/login', '/register', '/signup'];

// Routes that are accessible to both authenticated and unauthenticated users
const MIXED_ACCESS_ROUTES = ['/forgot-password'];

// Public routes that don't require authentication checks
const PUBLIC_ROUTES = ['/', '/products', '/about', '/contact'];

/**
 * Check if user is authenticated by examining and validating cookies
 * Enhanced with automatic token refresh for seamless authentication
 * This provides instant authentication state with automatic token management
 */
async function isAuthenticatedWithRefresh(request: NextRequest): Promise<{
  isAuthenticated: boolean;
  response?: NextResponse;
  userRole?: string;
}> {
  const result = await checkAuthenticationWithRefresh(request);

  // Extract user role from access token if available
  let userRole: string | undefined;
  if (result.isAuthenticated) {
    const accessToken = request.cookies.get('accessToken')?.value;
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        userRole = payload.role;
      } catch {
        // Ignore token parsing errors
      }
    }
  }

  return {
    isAuthenticated: result.isAuthenticated,
    response: result.response,
    userRole,
  };
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
 * Add pathname header to response for server component access
 */
function addPathnameHeader(response: NextResponse, pathname: string): NextResponse {
  response.headers.set('x-pathname', pathname);
  return response;
}

/**
 * Main middleware function with enhanced authentication and automatic token refresh
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // Handle public routes first (including specific admin test routes)
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route)) || pathname === '/') {
    // For public routes, we still want to refresh tokens if possible for better UX
    const authResult = await isAuthenticatedWithRefresh(request);

    // If we got new tokens from refresh, use that response
    if (authResult.response) {
      return addPathnameHeader(enhanceMiddlewareWithStorage(request, authResult.response), pathname);
    }

    // Otherwise, enhance response with storage preloading for better performance
    return addPathnameHeader(enhanceMiddlewareWithStorage(request, NextResponse.next()), pathname);
  }

  // Handle protected routes with enhanced authentication
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const authResult = await isAuthenticatedWithRefresh(request);

    if (!authResult.isAuthenticated) {
      // Redirect to login with return URL
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      return createInstantRedirect(loginUrl, request);
    }

    // Check if this is an admin route and user has admin role
    if (pathname.startsWith('/admin')) {
      if (authResult.userRole !== 'ADMIN') {
        // Non-admin user trying to access admin routes - redirect to home
        return createInstantRedirect('/', request);
      }
    }

    // Check if admin user is trying to access regular dashboard - redirect to admin dashboard
    if (pathname.startsWith('/dashboard') && authResult.userRole === 'ADMIN') {
      return createInstantRedirect('/admin', request);
    }

    // User is authenticated and has proper role, return the response (which may include new tokens)
    const response = authResult.response || NextResponse.next();
    return addPathnameHeader(response, pathname);
  }

  // Handle mixed access routes (forgot password, etc.) - allow both authenticated and unauthenticated users
  if (MIXED_ACCESS_ROUTES.some(route => pathname.startsWith(route))) {
    const authResult = await isAuthenticatedWithRefresh(request);

    // Allow access regardless of authentication status
    // If we got new tokens from refresh, use that response
    if (authResult.response) {
      return addPathnameHeader(enhanceMiddlewareWithStorage(request, authResult.response), pathname);
    }

    return addPathnameHeader(enhanceMiddlewareWithStorage(request, NextResponse.next()), pathname);
  }

  // Handle guest-only routes (login, register, etc.)
  if (GUEST_ONLY_ROUTES.some(route => pathname.startsWith(route))) {
    const authResult = await isAuthenticatedWithRefresh(request);

    if (authResult.isAuthenticated) {
      // Check if there's a redirect URL from login flow
      const redirectUrl = getRedirectUrl(request);

      // Determine destination based on user role
      let destination: string;
      if (authResult.userRole === 'ADMIN') {
        destination = redirectUrl || '/admin';
      } else {
        destination = redirectUrl || '/';
      }

      const redirectResponse = createInstantRedirect(destination, request);

      // If we have new tokens from refresh, preserve them in the redirect
      if (authResult.response) {
        const cookies = authResult.response.cookies.getAll();
        cookies.forEach(cookie => {
          redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
        });
      }

      return redirectResponse;
    }
    // User is not authenticated, allow access to guest routes
    return addPathnameHeader(NextResponse.next(), pathname);
  }



  // Default: allow access to other routes with storage preloading and token refresh
  const authResult = await isAuthenticatedWithRefresh(request);

  // If we got new tokens from refresh, use that response
  if (authResult.response) {
    return addPathnameHeader(enhanceMiddlewareWithStorage(request, authResult.response), pathname);
  }

  return addPathnameHeader(enhanceMiddlewareWithStorage(request, NextResponse.next()), pathname);
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
