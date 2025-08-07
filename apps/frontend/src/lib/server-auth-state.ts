/**
 * Server-Side Authentication State
 * Provides server-validated authentication state to eliminate client-side API calls
 * Extracts user data from JWT tokens for instant hydration
 */

import { cookies } from 'next/headers';
import { decodeJWTPayload } from '@/lib/server-jwt-decoder';

export interface ServerAuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'SELLER' | 'ADMIN';
    profile_image_url?: string;
    is_verified: boolean;
    created_at: string;
  } | null;
}

/**
 * Get server-side authentication state from JWT token
 * This eliminates the need for client-side API calls
 */
export async function getServerAuthState(): Promise<ServerAuthState> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return {
        isAuthenticated: false,
        user: null,
      };
    }

    // Decode JWT payload to extract user data
    const payload = decodeJWTPayload(accessToken);

    if (!payload) {
      return {
        isAuthenticated: false,
        user: null,
      };
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return {
        isAuthenticated: false,
        user: null,
      };
    }

    // Return server-validated user data
    return {
      isAuthenticated: true,
      user: {
        id: payload.userId,
        email: payload.email,
        name: payload.name || '',
        role: payload.role,
        profile_image_url: payload.profile_image_url,
        is_verified: payload.is_verified,
        created_at: payload.created_at || new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('[SERVER-AUTH-STATE] Error getting auth state:', error);
    return {
      isAuthenticated: false,
      user: null,
    };
  }
}

/**
 * Get server-side authentication state for admin routes
 * Returns null if user is not authenticated or not an admin
 */
export async function getServerAdminAuthState(): Promise<ServerAuthState> {
  const authState = await getServerAuthState();

  if (!authState.isAuthenticated || !authState.user || authState.user.role !== 'ADMIN') {
    return {
      isAuthenticated: false,
      user: null,
    };
  }

  return authState;
}

/**
 * Check if user is authenticated server-side
 * Lightweight check without full user data
 */
export async function isServerAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return false;
    }

    const payload = decodeJWTPayload(accessToken);
    if (!payload) {
      return false;
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get user role from server-side JWT
 * Returns null if not authenticated
 */
export async function getServerUserRole(): Promise<'USER' | 'SELLER' | 'ADMIN' | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) {
      return null;
    }

    const payload = decodeJWTPayload(accessToken);
    if (!payload) {
      return null;
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload.role;
  } catch (error) {
    return null;
  }
}
