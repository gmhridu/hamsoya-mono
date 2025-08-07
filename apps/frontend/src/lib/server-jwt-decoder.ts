/**
 * Server-Side JWT Token Decoder for Role-Based Redirects
 * Optimized for fast role extraction without database calls
 */

import { NextRequest } from 'next/server';

export interface JWTPayload {
  userId: string;
  email: string;
  name?: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  profile_image_url?: string;
  is_verified: boolean;
  created_at?: string;
  iat: number;
  exp: number;
}

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  payload?: JWTPayload;
  role?: 'USER' | 'SELLER' | 'ADMIN';
}

/**
 * Decode JWT token without verification (for role extraction)
 * Fast operation that doesn't require secret validation
 */
export function decodeJWTPayload(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));

    // Validate required fields
    if (!payload.userId || !payload.email || !payload.role) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      profile_image_url: payload.profile_image_url,
      is_verified: payload.is_verified || false,
      created_at: payload.created_at,
      iat: payload.iat || 0,
      exp: payload.exp || 0,
    };
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(payload: JWTPayload, bufferSeconds: number = 30): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + bufferSeconds;
}

/**
 * Extract user role from access token in request
 * Returns role immediately without database calls
 */
export function extractUserRoleFromRequest(request: NextRequest): {
  role: 'USER' | 'SELLER' | 'ADMIN' | null;
  isAuthenticated: boolean;
  isExpired: boolean;
} {
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    return {
      role: null,
      isAuthenticated: false,
      isExpired: true,
    };
  }

  const payload = decodeJWTPayload(accessToken);

  if (!payload) {
    return {
      role: null,
      isAuthenticated: false,
      isExpired: true,
    };
  }

  const expired = isTokenExpired(payload);

  return {
    role: payload.role,
    isAuthenticated: !expired,
    isExpired: expired,
  };
}

/**
 * Validate access token and extract role information
 * Optimized for middleware use
 */
export function validateTokenAndExtractRole(token: string): TokenValidationResult {
  if (!token) {
    return {
      isValid: false,
      isExpired: true,
    };
  }

  const payload = decodeJWTPayload(token);

  if (!payload) {
    return {
      isValid: false,
      isExpired: true,
    };
  }

  const expired = isTokenExpired(payload);

  return {
    isValid: !expired,
    isExpired: expired,
    payload,
    role: payload.role,
  };
}

/**
 * Get role-based redirect URL
 * Determines where user should be redirected based on their role
 */
export function getRoleBasedRedirectUrl(
  role: 'USER' | 'SELLER' | 'ADMIN',
  requestedPath?: string
): string {
  // If user requested a specific path, validate it based on role
  if (requestedPath && requestedPath !== '/login') {
    // Security: Admin routes only for admin users
    if (requestedPath.startsWith('/admin') && role !== 'ADMIN') {
      // Non-admin users trying to access admin routes get redirected to home
      return '/';
    }

    // Validate path security
    if (isValidRedirectPath(requestedPath)) {
      return requestedPath;
    }
  }

  // Default role-based redirects
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'SELLER':
      return '/dashboard'; // Seller dashboard
    case 'USER':
    default:
      return '/';
  }
}

/**
 * Validate redirect path for security
 */
function isValidRedirectPath(path: string): boolean {
  // Block external URLs
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return false;
  }

  // Block path traversal
  if (path.includes('..') || path.includes('//')) {
    return false;
  }

  // Must start with /
  if (!path.startsWith('/')) {
    return false;
  }

  return true;
}

/**
 * Extract redirect URL from request query parameters
 */
export function getRedirectFromRequest(request: NextRequest): string | null {
  const url = new URL(request.url);
  const redirect = url.searchParams.get('redirect');

  if (!redirect || !isValidRedirectPath(redirect)) {
    return null;
  }

  return redirect;
}
