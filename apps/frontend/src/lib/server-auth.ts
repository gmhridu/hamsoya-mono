/**
 * Comprehensive server-side authentication utilities
 * Centralized exports for all server-side auth functionality
 */

import type { User } from '@/types/auth';
import {
  getCurrentUser,
  getCurrentUserWithRefresh,
  getServerUser,
  hasRole,
  isAdmin,
  isAuthenticated,
  isSeller,
  protectRoute,
  requireAdmin,
  requireAuth,
  requireGuest,
  requireRole,
  requireSeller,
  type AuthResult,
} from './auth-server';

// Re-export all auth utilities
export {
  getCurrentUser,
  getCurrentUserWithRefresh,
  getServerUser,
  hasRole,
  isAdmin,
  isAuthenticated,
  isSeller,
  protectRoute,
  requireAdmin,
  requireAuth,
  requireGuest,
  requireRole,
  requireSeller,
  type AuthResult,

} from './auth-server';
import {
  getUserOrRedirect,
  redirectIfAuthenticated,
  redirectIfInsufficientRole,
  redirectIfNotAuthenticated,
  withServerAuth,
} from './auth-redirects';

export {
  getUserOrRedirect,
  redirectIfAuthenticated,
  redirectIfInsufficientRole,
  redirectIfNotAuthenticated,
  withServerAuth,
};

// Additional utility types
export interface ServerAuthOptions {
  requireAuth?: boolean;
  requireGuest?: boolean;
  allowedRoles?: Array<'USER' | 'SELLER' | 'ADMIN'>;
  redirectTo?: string;
}

export interface ProtectedPageProps {
  user: User;
}

export interface OptionalAuthPageProps {
  user: User | null;
}

/**
 * Quick auth check utilities for common patterns
 */

// For dashboard and profile pages
export const requireUserAuth = () => protectRoute();

// For admin pages
export const requireAdminAuth = () => requireAdmin();

// For seller pages
export const requireSellerAuth = () => requireSeller();

// For login/register pages
export const requireGuestAccess = () => requireGuest();

/**
 * Common redirect patterns
 */

// TODO: Implement redirect functions
// Protect dashboard route
// export const protectDashboard = (currentPath?: string) =>
//   redirectIfNotAuthenticated(currentPath || '/dashboard');

// Protect admin route
// export const protectAdmin = () => redirectIfInsufficientRole(['ADMIN'], '/');

// Protect seller route
// export const protectSellerRoute = () => redirectIfInsufficientRole(['SELLER', 'ADMIN'], '/');

// Redirect from login if authenticated
// export const redirectFromLogin = () => redirectIfAuthenticated('/');

/**
 * Server component auth patterns
 */

// For pages that require authentication
export async function getAuthenticatedUser(redirectPath?: string) {
  return await getUserOrRedirect(redirectPath);
}

// For pages that optionally show user data
export async function getOptionalUser() {
  const { user } = await getCurrentUser();
  return user;
}

// For admin-only pages
export async function getAdminUser() {
  return await requireAdmin();
}

// For seller pages
export async function getSellerUser() {
  return await requireSeller();
}

/**
 * Error handling utilities
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'UNAUTHORIZED' | 'ALREADY_AUTHENTICATED' | 'INSUFFICIENT_PERMISSIONS',
    public redirectTo?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export function handleAuthError(error: unknown, defaultRedirect: string = '/') {
  if (error instanceof Error) {
    switch (error.message) {
      case 'UNAUTHORIZED':
        return '/login';
      case 'ALREADY_AUTHENTICATED':
        return '/';
      case 'INSUFFICIENT_PERMISSIONS':
        return defaultRedirect;
      default:
        return defaultRedirect;
    }
  }
  return defaultRedirect;
}
