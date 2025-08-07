/**
 * Centralized Server Actions for Navigation
 * Provides instant server-side redirects without client-side JavaScript
 * Eliminates window.location.href usage for ChatGPT-style performance
 */

'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

/**
 * Decode JWT token to get user role
 */
async function getUserRoleFromToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    
    if (!accessToken) {
      return null;
    }

    // Decode without verification for role extraction
    const decoded = jwt.decode(accessToken) as any;
    return decoded?.role || null;
  } catch (error) {
    console.warn('Failed to decode token for role:', error);
    return null;
  }
}

/**
 * Validate redirect path based on user role for security
 */
function validateRedirectPath(path: string, userRole?: string | null): string | null {
  // Remove any potential XSS or malicious redirects
  if (!path || path.includes('javascript:') || path.includes('data:') || path.includes('//')) {
    return null;
  }

  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Admin route protection
  if (cleanPath.startsWith('/admin') && userRole !== 'ADMIN') {
    return '/'; // Redirect non-admin users to home
  }

  // Seller route protection (if you have seller routes)
  if (cleanPath.startsWith('/seller') && userRole !== 'SELLER' && userRole !== 'ADMIN') {
    return '/'; // Redirect non-seller users to home
  }

  return cleanPath;
}

/**
 * Server action for post-login redirect
 * Provides instant server-side redirect based on user role
 */
export async function redirectAfterLogin(redirectPath?: string): Promise<never> {
  const userRole = await getUserRoleFromToken();
  
  let finalRedirectPath = '/';

  if (redirectPath) {
    const validatedPath = validateRedirectPath(redirectPath, userRole);
    if (validatedPath) {
      finalRedirectPath = validatedPath;
    }
  }

  // Role-based default redirects
  if (!redirectPath || finalRedirectPath === '/') {
    if (userRole === 'ADMIN') {
      finalRedirectPath = '/admin';
    } else {
      finalRedirectPath = '/';
    }
  }

  console.log(`[SERVER-NAVIGATION] Redirecting ${userRole} user to: ${finalRedirectPath}`);
  redirect(finalRedirectPath);
}

/**
 * Server action for admin redirect
 * Ensures only admin users can access admin routes
 */
export async function redirectToAdmin(): Promise<never> {
  const userRole = await getUserRoleFromToken();
  
  if (userRole === 'ADMIN') {
    redirect('/admin');
  } else {
    redirect('/');
  }
}

/**
 * Server action for home redirect
 */
export async function redirectToHome(): Promise<never> {
  redirect('/');
}

/**
 * Server action for products redirect with optional search
 */
export async function redirectToProducts(searchQuery?: string): Promise<never> {
  if (searchQuery) {
    redirect(`/products?search=${encodeURIComponent(searchQuery)}`);
  } else {
    redirect('/products');
  }
}

/**
 * Server action for logout redirect
 */
export async function redirectAfterLogout(): Promise<never> {
  redirect('/login');
}

/**
 * Server action for role-based dashboard redirect
 */
export async function redirectToDashboard(): Promise<never> {
  const userRole = await getUserRoleFromToken();
  
  if (userRole === 'ADMIN') {
    redirect('/admin');
  } else if (userRole === 'SELLER') {
    redirect('/seller'); // If you have seller dashboard
  } else {
    redirect('/'); // Regular users go to home
  }
}

/**
 * Server action for secure redirect with role validation
 * Used for any navigation that needs role-based security
 */
export async function secureRedirect(path: string): Promise<never> {
  const userRole = await getUserRoleFromToken();
  const validatedPath = validateRedirectPath(path, userRole);
  
  if (validatedPath) {
    redirect(validatedPath);
  } else {
    // Invalid path, redirect to safe default
    redirect('/');
  }
}

/**
 * Server action for clearing cookies and redirecting
 * Used for security violations or forced logout
 */
export async function clearCookiesAndRedirect(redirectPath: string = '/login'): Promise<never> {
  const cookieStore = await cookies();
  
  // Clear all auth cookies
  cookieStore.set('accessToken', '', { maxAge: 0 });
  cookieStore.set('refreshToken', '', { maxAge: 0 });
  
  redirect(redirectPath);
}

/**
 * Server action for conditional redirect based on authentication
 */
export async function conditionalRedirect(
  authenticatedPath: string,
  unauthenticatedPath: string = '/login'
): Promise<never> {
  const userRole = await getUserRoleFromToken();
  
  if (userRole) {
    // User is authenticated
    const validatedPath = validateRedirectPath(authenticatedPath, userRole);
    redirect(validatedPath || '/');
  } else {
    // User is not authenticated
    redirect(unauthenticatedPath);
  }
}

/**
 * Server action for search redirect
 */
export async function redirectToSearch(query: string, category?: string): Promise<never> {
  const searchParams = new URLSearchParams();
  searchParams.set('search', query);
  
  if (category) {
    searchParams.set('category', category);
  }
  
  redirect(`/products?${searchParams.toString()}`);
}

/**
 * Server action for category redirect
 */
export async function redirectToCategory(categorySlug: string): Promise<never> {
  redirect(`/products?category=${encodeURIComponent(categorySlug)}`);
}

/**
 * Server action for product redirect
 */
export async function redirectToProduct(productId: string): Promise<never> {
  redirect(`/products/${encodeURIComponent(productId)}`);
}

/**
 * Server action for back navigation with fallback
 */
export async function redirectBack(fallbackPath: string = '/'): Promise<never> {
  // Since we can't access browser history on server, use fallback
  redirect(fallbackPath);
}

/**
 * Utility function to get redirect URL without redirecting
 * Useful for components that need to know where to redirect
 */
export async function getRedirectUrl(requestedPath?: string): Promise<string> {
  const userRole = await getUserRoleFromToken();
  
  if (requestedPath) {
    const validatedPath = validateRedirectPath(requestedPath, userRole);
    if (validatedPath) {
      return validatedPath;
    }
  }

  // Role-based default
  if (userRole === 'ADMIN') {
    return '/admin';
  } else {
    return '/';
  }
}

/**
 * Server action for immediate redirect (for emergency situations)
 */
export async function immediateRedirect(path: string): Promise<never> {
  redirect(path);
}
