import { redirect } from 'next/navigation';
import { getCurrentUser, protectRoute, requireGuest, requireRole } from './auth-server';

export async function redirectIfNotAuthenticated(redirectTo?: string) {
  try {
    await protectRoute();
  } catch (error) {
    const loginUrl = redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login';
    redirect(loginUrl);
  }
}

export async function redirectIfAuthenticated(redirectTo: string = '/') {
  try {
    const { isAuthenticated } = await getCurrentUser();

    if (isAuthenticated) {
      redirect(redirectTo);
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }

    if (error instanceof Error) {
      console.error('Error checking authentication in redirectIfAuthenticated:', error);
    }
  }
}

/**
 * Redirect if user doesn't have required role
 */
export async function redirectIfInsufficientRole(
  allowedRoles: Array<'USER' | 'SELLER' | 'ADMIN'>,
  redirectTo: string = '/'
) {
  try {
    await requireRole(allowedRoles);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      redirect('/login');
    } else {
      redirect(redirectTo);
    }
  }
}

/**
 * Get user with redirect on failure
 * Returns user or redirects to login
 */
export async function getUserOrRedirect(redirectTo?: string) {
  try {
    return await protectRoute();
  } catch (error) {
    const loginUrl = redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login';
    redirect(loginUrl);
  }
}

/**
 * Server-side auth wrapper for pages
 * Handles authentication and returns user data or redirects appropriately
 */
export async function withServerAuth<T>(
  handler: (user: any) => Promise<T> | T,
  options: {
    requireAuth?: boolean;
    requireGuest?: boolean;
    allowedRoles?: Array<'USER' | 'SELLER' | 'ADMIN'>;
    redirectTo?: string;
  } = {}
): Promise<T> {
  const {
    requireAuth = false,
    requireGuest: shouldRequireGuest = false,
    allowedRoles,
    redirectTo,
  } = options;

  try {
    if (shouldRequireGuest) {
      await requireGuest();
      return await handler(null);
    }

    if (requireAuth || allowedRoles) {
      const user = allowedRoles ? await requireRole(allowedRoles) : await protectRoute();
      return await handler(user);
    }

    // Optional auth - get user if available
    const { user } = await getCurrentUser();
    return await handler(user);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'UNAUTHORIZED':
          const loginUrl = redirectTo
            ? `/login?redirect=${encodeURIComponent(redirectTo)}`
            : '/login';
          redirect(loginUrl);
        case 'ALREADY_AUTHENTICATED':
          redirect(redirectTo || '/');
        case 'INSUFFICIENT_PERMISSIONS':
          redirect('/');
        default:
          redirect('/');
      }
    }
    redirect('/');
  }
}
