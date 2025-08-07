/**
 * Comprehensive Security Logout Utility
 * Handles complete authentication cleanup for security violations
 */

import { clearAllAuthCookies } from '@/lib/cookies';

interface SecurityLogoutOptions {
  reason?: string;
  redirectTo?: string;
  clearClientState?: boolean;
}

/**
 * Perform comprehensive security logout
 * Clears all authentication data and redirects user
 */
export async function performSecurityLogout(options: SecurityLogoutOptions = {}) {
  const {
    reason = 'Security violation detected',
    redirectTo = '/login',
    clearClientState = true,
  } = options;

  try {
    // 1. IMMEDIATE client-side cookie cleanup
    if (clearClientState) {
      clearAllAuthCookies();

      // Additional immediate cookie cleanup for refresh token
      if (typeof document !== 'undefined') {
        // Force immediate refresh token cleanup with multiple attempts
        const refreshTokenVariants = ['refreshToken', 'refresh_token', 'REFRESH_TOKEN'];
        refreshTokenVariants.forEach(name => {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; max-age=0; SameSite=Strict; Secure=${window.location.protocol === 'https:'}`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; max-age=0`;
        });
      }
    }

    // 2. Clear localStorage authentication data
    if (typeof window !== 'undefined' && clearClientState) {
      // Clear auth-related localStorage items
      const authKeys = [
        'auth-token',
        'refresh-token',
        'refreshToken',
        'access-token',
        'accessToken',
        'user-data',
        'auth-state',
        'session-data',
        'jwt-token',
        'bearer-token',
      ];

      authKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          // Ignore localStorage errors
        }
      });

      // Clear sessionStorage as well
      try {
        sessionStorage.clear();
      } catch (error) {
        // Ignore sessionStorage errors
      }
    }

    // 3. Call backend logout endpoint to invalidate server-side session
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      // Make logout request (fire and forget - don't wait for response)
      fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => {
        // Ignore logout API errors - we're already logging out
      });
    } catch (error) {
      // Ignore API errors during security logout
    }

    // 4. Redirect to login with error message using server action
    const { clearCookiesAndRedirect } = await import('@/lib/server-navigation');
    const redirectUrl = reason ? `/login?error=${encodeURIComponent(reason)}` : '/login';
    await clearCookiesAndRedirect(redirectUrl);
  } catch (error) {
    console.error('Security logout error:', error);

    // Fallback: force redirect even if cleanup fails
    const { clearCookiesAndRedirect } = await import('@/lib/server-navigation');
    await clearCookiesAndRedirect('/login?error=' + encodeURIComponent('Security error occurred'));
  }
}

/**
 * Handle insufficient permissions (non-admin accessing admin routes)
 */
export async function handleInsufficientPermissions() {
  await performSecurityLogout({
    reason: 'Insufficient permissions. Access denied.',
    redirectTo: '/login',
    clearClientState: true,
  });
}

/**
 * Handle authentication errors (invalid/expired tokens)
 */
export async function handleAuthenticationError() {
  await performSecurityLogout({
    reason: 'Authentication error. Please log in again.',
    redirectTo: '/login',
    clearClientState: true,
  });
}

/**
 * Handle token corruption or server restart scenarios
 */
export async function handleTokenCorruption() {
  await performSecurityLogout({
    reason: 'Session expired. Please log in again.',
    redirectTo: '/login',
    clearClientState: true,
  });
}

/**
 * Client-side security check for admin routes
 * Use this in components that need immediate security validation
 */
export function performClientSecurityCheck(userRole?: string, requiredRole: string = 'ADMIN'): boolean {
  // Check if user has required role
  if (!userRole || userRole !== requiredRole) {
    // Perform security logout for insufficient permissions
    handleInsufficientPermissions();
    return false;
  }

  return true;
}

/**
 * Enhanced logout for security violations
 * More aggressive than regular logout
 */
export async function securityViolationLogout(violationType: string) {
  console.warn(`Security violation detected: ${violationType}`);

  await performSecurityLogout({
    reason: `Security violation: ${violationType}`,
    redirectTo: '/login',
    clearClientState: true,
  });
}

/**
 * Check if current environment supports security features
 */
export function isSecurityEnvironmentReady(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Validate admin access and handle security violations
 */
export function validateAdminAccess(user: any): boolean {
  if (!user) {
    handleAuthenticationError();
    return false;
  }

  if (user.role !== 'ADMIN') {
    handleInsufficientPermissions();
    return false;
  }

  return true;
}
