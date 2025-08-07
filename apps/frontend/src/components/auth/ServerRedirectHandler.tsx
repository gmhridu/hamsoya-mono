/**
 * Server Component for Instant Role-Based Redirects
 * Performs server-side redirects before any content renders
 * Eliminates content flashing and provides ChatGPT-style instant navigation
 */

import { getCurrentUser } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

interface ServerRedirectHandlerProps {
  /**
   * The page the user is trying to access
   */
  currentPath: string;

  /**
   * Whether this is a protected route that requires authentication
   */
  requiresAuth?: boolean;

  /**
   * Whether this is a guest-only route (login, register)
   */
  guestOnly?: boolean;

  /**
   * Custom redirect URL to use instead of role-based default
   */
  customRedirectUrl?: string;

  /**
   * Minimum role required to access this route
   */
  minimumRole?: 'USER' | 'SELLER' | 'ADMIN';
}

/**
 * Server component that handles instant role-based redirects
 * Should be used in layout.tsx or page.tsx for immediate redirects
 */
export async function ServerRedirectHandler({
  currentPath,
  requiresAuth = false,
  guestOnly = false,
  customRedirectUrl,
  minimumRole,
}: ServerRedirectHandlerProps) {
  try {
    // Get current user instantly from server-side auth
    const authResult = await getCurrentUser();
    const user = authResult.isAuthenticated ? authResult.user : null;

    // Handle guest-only routes (login, register, etc.)
    if (guestOnly && user) {
      const redirectUrl = customRedirectUrl || getRoleBasedDefaultUrl(user.role);
      console.log(`[SERVER-REDIRECT] Guest-only route, authenticated user -> ${redirectUrl}`);
      redirect(redirectUrl);
    }

    // Handle protected routes
    if (requiresAuth && !user) {
      const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
      console.log(`[SERVER-REDIRECT] Protected route, unauthenticated -> ${loginUrl}`);
      redirect(loginUrl);
    }

    // Handle role-based access control
    if (user && minimumRole && !hasRequiredRole(user.role, minimumRole)) {
      const redirectUrl = customRedirectUrl || getRoleBasedDefaultUrl(user.role);
      console.log(`[SERVER-REDIRECT] Insufficient role: ${user.role} < ${minimumRole} -> ${redirectUrl}`);
      redirect(redirectUrl);
    }

    // Handle admin route access
    if (currentPath.startsWith('/admin') && user?.role !== 'ADMIN') {
      const redirectUrl = customRedirectUrl || '/';
      console.log(`[SERVER-REDIRECT] Non-admin accessing admin route -> ${redirectUrl}`);
      redirect(redirectUrl);
    }

    // No redirect needed - user can access this route
    return null;

  } catch (error) {
    console.error('[SERVER-REDIRECT] Error:', error);

    // On error, redirect to safe default
    if (requiresAuth) {
      redirect('/login');
    }

    return null;
  }
}

/**
 * Get default redirect URL based on user role
 */
function getRoleBasedDefaultUrl(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'SELLER':
      return '/dashboard';
    case 'USER':
    default:
      return '/';
  }
}

/**
 * Check if user has required role
 */
function hasRequiredRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'USER': 1,
    'SELLER': 2,
    'ADMIN': 3,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
}

/**
 * Hook for client-side redirect handling (fallback)
 * Use this in client components when server-side redirect is not possible
 */
export function useClientRedirectHandler() {
  // This would be implemented for client-side fallback scenarios
  // But the goal is to eliminate client-side redirects in favor of server-side
  return {
    redirectToLogin: (returnUrl?: string) => {
      const url = returnUrl ? `/login?redirect=${encodeURIComponent(returnUrl)}` : '/login';
      window.location.href = url;
    },
    redirectToHome: () => {
      window.location.href = '/';
    },
    redirectToAdmin: () => {
      window.location.href = '/admin';
    },
    redirectToDashboard: () => {
      window.location.href = '/dashboard';
    },
  };
}

/**
 * Utility function for manual server-side redirects
 * Can be used in server actions or API routes
 */
export function performServerRedirect(
  userRole: string | null,
  currentPath: string,
  options: {
    requiresAuth?: boolean;
    guestOnly?: boolean;
    customRedirectUrl?: string;
    minimumRole?: 'USER' | 'SELLER' | 'ADMIN';
  } = {}
): string | null {
  const { requiresAuth, guestOnly, customRedirectUrl, minimumRole } = options;

  // Handle guest-only routes
  if (guestOnly && userRole) {
    return customRedirectUrl || getRoleBasedDefaultUrl(userRole);
  }

  // Handle protected routes
  if (requiresAuth && !userRole) {
    return `/login?redirect=${encodeURIComponent(currentPath)}`;
  }

  // Handle role-based access control
  if (userRole && minimumRole && !hasRequiredRole(userRole, minimumRole)) {
    return customRedirectUrl || getRoleBasedDefaultUrl(userRole);
  }

  // Handle admin route access
  if (currentPath.startsWith('/admin') && userRole !== 'ADMIN') {
    return customRedirectUrl || '/';
  }

  // No redirect needed
  return null;
}
