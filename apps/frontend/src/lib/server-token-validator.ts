/**
 * Server-Side Token Validation Utility
 * Handles JWT token validation and refresh for SSR and middleware
 */

import { NextRequest, NextResponse } from 'next/server';

interface TokenPayload {
  userId: string;
  email: string;
  name?: string;
  role: string;
  profile_image_url?: string;
  is_verified: boolean;
  iat: number;
  exp: number;
}

interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  payload?: TokenPayload;
  needsRefresh: boolean;
}

interface RefreshResult {
  success: boolean;
  newTokens?: {
    accessToken: string;
    refreshToken: string;
  };
  user?: any;
}

/**
 * Decode JWT token without verification (for expiration checking)
 */
function decodeJWT(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired or about to expire
 */
function isTokenExpired(payload: TokenPayload, bufferSeconds: number = 30): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + bufferSeconds;
}

/**
 * Validate access token and determine if refresh is needed
 */
export function validateAccessToken(token: string): TokenValidationResult {
  if (!token) {
    return {
      isValid: false,
      isExpired: true,
      needsRefresh: true,
    };
  }

  const payload = decodeJWT(token);
  if (!payload) {
    return {
      isValid: false,
      isExpired: true,
      needsRefresh: true,
    };
  }

  const expired = isTokenExpired(payload);

  return {
    isValid: !expired,
    isExpired: expired,
    payload,
    needsRefresh: expired,
  };
}

/**
 * Attempt to refresh tokens server-side
 */
export async function attemptServerSideRefresh(
  request: NextRequest
): Promise<RefreshResult> {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return { success: false };
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const response = await fetch(`${backendUrl}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (!response.ok) {
      return { success: false };
    }

    const data = await response.json();

    // Extract new tokens from response
    const newAccessToken = data.data?.accessToken || data.accessToken;
    const newRefreshToken = data.data?.refreshToken || data.refreshToken;
    const user = data.data?.user || data.user;

    if (!newAccessToken || !newRefreshToken) {
      return { success: false };
    }

    return {
      success: true,
      newTokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      user,
    };
  } catch (error) {
    console.error('Server-side refresh failed:', error);
    return { success: false };
  }
}

/**
 * Set new tokens in response cookies
 */
export function setTokenCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string }
): void {
  const isProduction = process.env.NODE_ENV === 'production';

  // Set access token (non-httpOnly for API calls)
  response.cookies.set('accessToken', tokens.accessToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 5 * 60, // 5 minutes
    path: '/',
  });

  // Set refresh token (httpOnly for security)
  response.cookies.set('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set('accessToken', '', {
    httpOnly: false,
    maxAge: 0,
    path: '/',
  });

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
}

/**
 * Check if guest session might be interfering with authentication
 * Guest sessions use different cookie names and shouldn't interfere,
 * but this function helps identify potential conflicts
 */
export function hasGuestSession(request: NextRequest): boolean {
  const sessionId = request.cookies.get('session_id')?.value;
  return !!sessionId && sessionId.startsWith('guest_');
}

/**
 * Get authentication debug info for troubleshooting
 */
export function getAuthDebugInfo(request: NextRequest): {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  hasGuestSession: boolean;
  accessTokenExpired?: boolean;
  guestSessionId?: string;
} {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const sessionId = request.cookies.get('session_id')?.value;

  let accessTokenExpired: boolean | undefined;

  if (accessToken) {
    const validation = validateAccessToken(accessToken);
    accessTokenExpired = validation.isExpired;
  }

  return {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    hasGuestSession: hasGuestSession(request),
    accessTokenExpired,
    guestSessionId: sessionId,
  };
}

/**
 * Enhanced authentication check for middleware
 * Returns authentication status and handles token refresh
 */
export async function checkAuthenticationWithRefresh(
  request: NextRequest
): Promise<{
  isAuthenticated: boolean;
  needsRedirect: boolean;
  response?: NextResponse;
}> {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // No tokens at all - not authenticated
  if (!accessToken && !refreshToken) {
    return {
      isAuthenticated: false,
      needsRedirect: true,
    };
  }

  // No access token but have refresh token - try to refresh
  if (!accessToken && refreshToken) {
    const refreshResult = await attemptServerSideRefresh(request);

    if (refreshResult.success && refreshResult.newTokens) {
      // Create response with new tokens
      const response = NextResponse.next();
      setTokenCookies(response, refreshResult.newTokens);

      return {
        isAuthenticated: true,
        needsRedirect: false,
        response,
      };
    } else {
      // Refresh failed - clear cookies and redirect
      const response = NextResponse.redirect(new URL('/login', request.url));
      clearAuthCookies(response);

      return {
        isAuthenticated: false,
        needsRedirect: true,
        response,
      };
    }
  }

  // Have access token - validate it
  if (accessToken) {
    const validation = validateAccessToken(accessToken);

    if (validation.isValid) {
      // Token is valid - user is authenticated
      return {
        isAuthenticated: true,
        needsRedirect: false,
      };
    } else if (validation.needsRefresh && refreshToken) {
      // Token expired but we have refresh token - try to refresh
      const refreshResult = await attemptServerSideRefresh(request);

      if (refreshResult.success && refreshResult.newTokens) {
        // Create response with new tokens
        const response = NextResponse.next();
        setTokenCookies(response, refreshResult.newTokens);

        return {
          isAuthenticated: true,
          needsRedirect: false,
          response,
        };
      } else {
        // Refresh failed - clear cookies and redirect
        const response = NextResponse.redirect(new URL('/login', request.url));
        clearAuthCookies(response);

        return {
          isAuthenticated: false,
          needsRedirect: true,
          response,
        };
      }
    } else {
      // Token invalid and no refresh token - redirect
      return {
        isAuthenticated: false,
        needsRedirect: true,
      };
    }
  }

  // Fallback - not authenticated
  return {
    isAuthenticated: false,
    needsRedirect: true,
  };
}
