/**
 * Server-side authentication utilities
 * For use in Server Components, Server Actions, and API routes
 */

import type { User } from '@/types/auth';
import { AUTH_CONFIG } from '@/types/auth';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export interface AuthResult {
  user: User | null;
  isAuthenticated: boolean;
}

// Cache for getCurrentUser to prevent redundant calls within the same request
const authCache = new Map<string, { result: AuthResult; timestamp: number }>();
const CACHE_DURATION = AUTH_CONFIG.serverCacheDuration; // 1 minute cache for better performance

/**
 * Attempt to refresh tokens using the refresh token
 * Returns new payload if successful, null if failed
 */
async function attemptTokenRefresh(): Promise<{ success: boolean; payload?: any }> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return { success: false };
    }

    // Call the refresh endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return { success: false };
    }

    const data = await response.json();

    if (data.success && data.data?.accessToken) {
      // Extract new tokens from response
      const newAccessToken = data.data.accessToken;
      const newRefreshToken = data.data.refreshToken;

      // Update cookies with new tokens
      const { cookies: setCookies } = await import('next/headers');
      const cookieStore = await setCookies();

      // Set new access token
      cookieStore.set('accessToken', newAccessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 5 * 60, // 5 minutes
        path: '/',
      });

      // Set new refresh token if provided
      if (newRefreshToken) {
        cookieStore.set('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/',
        });
      }

      // Verify and return the new access token payload
      const payload = await verifyAccessToken(newAccessToken);
      return { success: true, payload };
    }

    return { success: false };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Verify JWT access token on the server
 * Using jsonwebtoken library to match backend implementation
 */
async function verifyAccessToken(token: string): Promise<any> {
  try {
    if (!process.env.JWT_ACCESS_SECRET) {
      return null;
    }

    // Use jsonwebtoken.verify (same as backend)
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    });

    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify JWT refresh token on the server
 * Using jsonwebtoken library to match backend implementation
 */
function verifyRefreshToken(token: string): any {
  try {
    if (!process.env.JWT_REFRESH_SECRET) {
      console.error('JWT_REFRESH_SECRET environment variable is required');
      return null;
    }

    // Use jsonwebtoken.verify (same as backend)
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      algorithms: ['HS256'],
    });

    return payload;
  } catch (error) {
    // More detailed error logging for debugging
    if (error instanceof Error) {
      console.error('JWT refresh token verification error:', {
        name: error.name,
        message: error.message,
        tokenLength: token?.length,
        secretExists: !!process.env.JWT_REFRESH_SECRET,
        secretLength: process.env.JWT_REFRESH_SECRET?.length,
      });
    }
    return null;
  }
}

/**
 * Get current user from server-side cookies
 * This runs on the server and provides instant auth state with automatic token refresh
 */
export async function getCurrentUser(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    // Create cache key based on token
    const cacheKey = accessToken || 'no-token';
    const now = Date.now();

    // Check cache first to prevent redundant calls
    const cached = authCache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return cached.result;
    }

    // If no access token, check for refresh token and attempt refresh
    if (!accessToken) {
      const refreshToken = cookieStore.get('refreshToken')?.value;
      if (refreshToken) {
        // Attempt to refresh tokens using the refresh token
        const refreshResult = await attemptTokenRefresh();
        if (refreshResult.success && refreshResult.payload) {
          // Successfully refreshed, continue with the new payload
          const user: User = {
            id: refreshResult.payload.userId as string,
            email: refreshResult.payload.email as string,
            name:
              (refreshResult.payload.name as string) || refreshResult.payload.email.split('@')[0],
            role: (refreshResult.payload.role as 'USER' | 'SELLER' | 'ADMIN') || 'USER',
            profile_image_url: (refreshResult.payload.profile_image_url as string) || undefined,
            is_verified: (refreshResult.payload.is_verified as boolean) || true,
            created_at: (refreshResult.payload.created_at as string) || new Date().toISOString(),
          };

          const result = { user, isAuthenticated: true };
          authCache.set('refreshed-token', { result, timestamp: now });
          return result;
        }
      }

      // No valid tokens found
      const result = { user: null, isAuthenticated: false };
      authCache.set(cacheKey, { result, timestamp: now });
      return result;
    }

    // Verify and decode the token
    let payload: any;
    let shouldRefresh = false;

    try {
      payload = await verifyAccessToken(accessToken);
    } catch (error) {
      // Access token is invalid/expired, try to refresh it
      shouldRefresh = true;
    }

    // If access token is invalid/expired, try to refresh it
    if (shouldRefresh || !payload) {
      const refreshResult = await attemptTokenRefresh();
      if (refreshResult.success && refreshResult.payload) {
        payload = refreshResult.payload;
      } else {
        const result = { user: null, isAuthenticated: false };
        authCache.set(cacheKey, { result, timestamp: now });
        return result;
      }
    }

    // Extract user data from token payload (matching backend JWT structure)
    const user: User = {
      id: payload.userId as string,
      email: payload.email as string,
      name: (payload.name as string) || payload.email.split('@')[0], // Fallback to email prefix if name not available
      role: (payload.role as 'USER' | 'SELLER' | 'ADMIN') || 'USER',
      profile_image_url: (payload.profile_image_url as string) || undefined,
      is_verified: (payload.is_verified as boolean) || true, // Assume verified if token exists
      created_at: (payload.created_at as string) || new Date().toISOString(),
    };

    const result = { user, isAuthenticated: true };

    // Cache the successful result
    authCache.set(cacheKey, { result, timestamp: now });

    return result;
  } catch (error) {
    console.error('Error getting current user:', error);
    return { user: null, isAuthenticated: false };
  }
}

/**
 * Check if user is authenticated (lightweight version)
 */
export async function isAuthenticated(): Promise<boolean> {
  const { isAuthenticated } = await getCurrentUser();
  return isAuthenticated;
}

/**
 * Require authentication - throws if not authenticated
 * Use in Server Actions or API routes
 */
export async function requireAuth(): Promise<User> {
  const { user, isAuthenticated } = await getCurrentUser();

  if (!isAuthenticated || !user) {
    throw new Error('Authentication required');
  }

  return user;
}

/**
 * Get user with fallback to API call if token is invalid
 * Use this if you need to refresh tokens or validate against database
 * Note: This function cannot set cookies - use getCurrentUserWithRefreshAndCookies for that
 */
export async function getCurrentUserWithRefresh(): Promise<AuthResult> {
  // First try token-based auth
  const tokenResult = await getCurrentUser();

  if (tokenResult.isAuthenticated) {
    return tokenResult;
  }

  // If token auth fails, try refresh token
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return { user: null, isAuthenticated: false };
    }

    // Call your API to refresh tokens
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (!response.ok) {
      return { user: null, isAuthenticated: false };
    }

    const data = await response.json();

    // Extract tokens from response
    const newAccessToken = data.data?.accessToken || data.accessToken;
    const newRefreshToken = data.data?.refreshToken || data.refreshToken;
    const user = data.data?.user || data.user;

    // Set new cookies if tokens were refreshed
    if (newAccessToken && newRefreshToken) {
      const cookieStore = await cookies();
      const isProduction = process.env.NODE_ENV === 'production';

      // Set access token (non-httpOnly for API calls)
      cookieStore.set('accessToken', newAccessToken, {
        httpOnly: false,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 5 * 60, // 5 minutes
        path: '/',
      });

      // Set refresh token (httpOnly for security)
      cookieStore.set('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
    }

    return {
      user,
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Error refreshing user session:', error);
    return { user: null, isAuthenticated: false };
  }
}

/**
 * Server-side route protection utility
 * Use in Server Components or Server Actions to protect routes
 * WARNING: This throws errors - use protectRouteSafe for server components
 */
export async function protectRoute(): Promise<User> {
  const { user, isAuthenticated } = await getCurrentUser();

  if (!isAuthenticated || !user) {
    throw new Error('UNAUTHORIZED');
  }

  return user;
}

/**
 * Safe server-side route protection utility
 * Returns null instead of throwing errors - better for server components
 * Middleware should handle redirects, this just provides user data
 */
export async function protectRouteSafe(): Promise<User | null> {
  const { user, isAuthenticated } = await getCurrentUser();

  if (!isAuthenticated || !user) {
    return null;
  }

  return user;
}

/**
 * Server-side guest-only route protection
 * Throws error if user is authenticated (for login/register pages)
 */
export async function requireGuest(): Promise<void> {
  const { isAuthenticated } = await getCurrentUser();

  if (isAuthenticated) {
    throw new Error('ALREADY_AUTHENTICATED');
  }
}

/**
 * Role-based access control for server components
 */
export async function requireRole(allowedRoles: Array<'USER' | 'SELLER' | 'ADMIN'>): Promise<User> {
  const user = await protectRoute();

  if (!allowedRoles.includes(user.role)) {
    throw new Error('INSUFFICIENT_PERMISSIONS');
  }

  return user;
}

/**
 * Admin-only access control
 * WARNING: This throws errors - use requireAdminSafe for server components
 */
export async function requireAdmin(): Promise<User> {
  return await requireRole(['ADMIN']);
}

/**
 * Safe admin-only access control
 * Returns null instead of throwing errors - better for server components
 */
export async function requireAdminSafe(): Promise<User | null> {
  const user = await protectRouteSafe();

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return user;
}

/**
 * Seller or Admin access control
 */
export async function requireSeller(): Promise<User> {
  return await requireRole(['SELLER', 'ADMIN']);
}

/**
 * Safe seller or admin access control
 * Returns null instead of throwing errors - better for server components
 */
export async function requireSellerSafe(): Promise<User | null> {
  const user = await protectRouteSafe();

  if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
    return null;
  }

  return user;
}

/**
 * Get user data for server components with optional fallback
 */
export async function getServerUser(): Promise<User | null> {
  const { user } = await getCurrentUser();
  return user;
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: 'USER' | 'SELLER' | 'ADMIN'): Promise<boolean> {
  const user = await getServerUser();
  return user?.role === role || false;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return await hasRole('ADMIN');
}

/**
 * Check if user is seller or admin
 */
export async function isSeller(): Promise<boolean> {
  const user = await getServerUser();
  return user?.role === 'SELLER' || user?.role === 'ADMIN' || false;
}
