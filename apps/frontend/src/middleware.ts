/**
 * Next.js Middleware for Instant Server-Side Authentication
 * Provides ChatGPT-style instant navigation with zero loading states
 * Handles all authentication redirects before any content renders
 * Enhanced with automatic token refresh for seamless user experience
 */

import { enhanceMiddlewareWithStorage } from '@/lib/server-storage-middleware';
import { checkAuthenticationWithRefresh } from '@/lib/server-token-validator';
import {
  extractUserRoleFromRequest,
  getRoleBasedRedirectUrl,
  getRedirectFromRequest
} from '@/lib/server-jwt-decoder';
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
 * Ensures immediate navigation without caching issues and prevents any content rendering
 */
function createInstantRedirect(url: string, request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL(url, request.url), 302); // Found redirect for instant response

  // Headers for instant navigation and no caching
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');

  // Additional headers to prevent any content rendering
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'no-referrer');

  // Ensure immediate redirect without any delay
  response.headers.set('Location', new URL(url, request.url).toString());

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
 * Clear all authentication cookies and session data
 * Enhanced for comprehensive security cleanup with immediate effect
 */
function clearAllAuthCookies(response: NextResponse): void {
  const isProduction = process.env.NODE_ENV === 'production';

  // Clear access token with multiple approaches for immediate effect
  response.cookies.set('accessToken', '', {
    httpOnly: false,
    maxAge: 0,
    expires: new Date(0),
    path: '/',
    secure: isProduction,
    sameSite: 'strict',
  });

  // Clear refresh token with immediate expiration
  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    maxAge: 0,
    expires: new Date(0),
    path: '/',
    secure: isProduction,
    sameSite: 'strict',
  });

  // Also try alternative cookie names that might exist
  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    maxAge: 0,
    expires: new Date(0),
    path: '/',
    secure: isProduction,
    sameSite: 'strict',
  });

  response.cookies.set('access_token', '', {
    httpOnly: false,
    maxAge: 0,
    expires: new Date(0),
    path: '/',
    secure: isProduction,
    sameSite: 'strict',
  });

  // Clear any session cookies
  response.cookies.set('session_id', '', {
    httpOnly: false,
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });

  // Clear any other auth-related cookies
  response.cookies.set('user_role', '', {
    httpOnly: false,
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });

  // Clear cart and bookmark count cookies for security
  response.cookies.set('cart_count', '', {
    httpOnly: false,
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });

  response.cookies.set('bookmark_count', '', {
    httpOnly: false,
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  });
}

/**
 * Create secure logout redirect with complete auth cleanup
 * Used when non-admin users try to access admin routes
 */
function createSecureLogoutRedirect(request: NextRequest, message?: string): NextResponse {
  const loginUrl = new URL('/login', request.url);

  if (message) {
    loginUrl.searchParams.set('error', message);
  }

  const response = createInstantRedirect(loginUrl.toString(), request);
  clearAllAuthCookies(response);

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

  // PRIORITY 1: Handle admin routes FIRST with optimized security checks
  // This prevents any content rendering for unauthorized users
  if (pathname.startsWith('/admin')) {
    // OPTIMIZATION: Fast JWT role extraction first (no database calls)
    const roleInfo = extractUserRoleFromRequest(request);

    if (!roleInfo.isAuthenticated || roleInfo.role !== 'ADMIN') {
      // Fast rejection for non-admin users
      const loginUrl = `/login?error=${encodeURIComponent('Admin access required')}`;
      const response = createInstantRedirect(loginUrl, request);
      clearAllAuthCookies(response);
      return response;
    }

    // For admin users, do full authentication check with refresh
    const authResult = await isAuthenticatedWithRefresh(request);

    if (!authResult.isAuthenticated) {
      const loginUrl = `/login?error=${encodeURIComponent('Authentication required')}`;
      const response = createInstantRedirect(loginUrl, request);
      clearAllAuthCookies(response);
      return response;
    }

    if (!authResult.userRole || authResult.userRole !== 'ADMIN') {
      const loginUrl = `/login?error=${encodeURIComponent('Insufficient permissions. Access denied.')}`;
      const response = createInstantRedirect(loginUrl, request);
      clearAllAuthCookies(response);
      return response;
    }

    // Admin user with valid authentication - allow access
    const response = authResult.response || NextResponse.next();
    return addPathnameHeader(response, pathname);
  }

  // Handle public routes (only after admin routes are secured)
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

  // Handle other protected routes with enhanced authentication
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const authResult = await isAuthenticatedWithRefresh(request);

    // Issue 1: Unauthenticated user access control
    if (!authResult.isAuthenticated) {
      // Clear any stale cookies and redirect to login with return URL
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      const response = createInstantRedirect(loginUrl, request);
      clearAllAuthCookies(response);
      return response;
    }

    // Admin routes are handled above with priority - skip here

    // Check if admin user is trying to access regular dashboard - redirect to admin dashboard
    if (pathname.startsWith('/dashboard') && authResult.userRole === 'ADMIN') {
      return createInstantRedirect('/admin', request);
    }

    // User is authenticated and has proper role for non-admin protected routes
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
    // Skip middleware checks for POST requests to avoid interfering with server actions
    if (request.method === 'POST') {
      return addPathnameHeader(NextResponse.next(), pathname);
    }

    // OPTIMIZATION: Use fast JWT decoding for immediate role-based redirects
    // This ensures users are redirected BEFORE HTML loads for ChatGPT-style performance
    const roleInfo = extractUserRoleFromRequest(request);

    if (roleInfo.isAuthenticated && roleInfo.role) {
      // Fast server-side role-based redirect without database calls
      const requestedRedirect = getRedirectFromRequest(request);
      const destination = getRoleBasedRedirectUrl(roleInfo.role, requestedRedirect || undefined);

      console.log(`[MIDDLEWARE] Instant role-based redirect: ${roleInfo.role} -> ${destination}`);

      // Instant redirect before HTML loads
      return createInstantRedirect(destination, request);
    }

    // If token is expired or invalid, fall back to full auth check for token refresh
    if (roleInfo.isExpired) {
      const authResult = await isAuthenticatedWithRefresh(request);

      if (authResult.isAuthenticated) {
        // After token refresh, get role and redirect
        const refreshedRoleInfo = extractUserRoleFromRequest(request);
        const requestedRedirect = getRedirectFromRequest(request);
        const destination = getRoleBasedRedirectUrl(
          refreshedRoleInfo.role || 'USER',
          requestedRedirect || undefined
        );

        const redirectResponse = createInstantRedirect(destination, request);

        // Preserve refreshed tokens in the redirect
        if (authResult.response) {
          const cookies = authResult.response.cookies.getAll();
          cookies.forEach(cookie => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
          });
        }

        return redirectResponse;
      }
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
