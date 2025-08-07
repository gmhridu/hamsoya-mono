/**
 * Server Actions for Authentication
 * Provides server-side authentication with instant redirects
 * Eliminates client-side loading states and navigation delays
 */

'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

/**
 * Validate redirect URL based on user role
 * SECURITY: Prevents unauthorized users from being redirected to admin routes
 */
function validateRedirectForRole(url: string, userRole?: string): string | null {
  if (!url || url === '/login') {
    return null;
  }

  // Security check: Admin routes only for admin users
  if (url.startsWith('/admin') && userRole !== 'ADMIN') {
    return null; // Block admin redirects for non-admin users
  }

  // Additional security checks
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return null; // Block external redirects
  }

  if (url.includes('..') || url.includes('//')) {
    return null; // Block path traversal attempts
  }

  return url;
}

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  profile_image_url: z.string().optional(),
});

interface AuthResponse {
  success: boolean;
  data?: {
    user: any;
    message: string;
  };
  message?: string;
  error?: string;
}

/**
 * Server action for user login
 * Provides instant authentication with server-side redirects
 */
export async function loginAction(formData: FormData) {
  try {
    // Extract and validate form data
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const validatedData = LoginSchema.parse(rawData);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    // Call backend API
    const response = await fetch(`${backendUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    // Extract cookies from response headers
    const setCookieHeaders = response.headers.get('set-cookie');
    if (setCookieHeaders) {
      // Parse and set cookies
      const cookieStore = await cookies();

      // Extract access token and refresh token from set-cookie headers
      const cookieStrings = setCookieHeaders.split(',');

      for (const cookieString of cookieStrings) {
        const [nameValue, ...attributes] = cookieString.trim().split(';');
        const [name, value] = nameValue.split('=');

        if (name === 'accessToken' || name === 'refreshToken') {
          // Parse cookie attributes
          const cookieOptions: any = {
            httpOnly: name === 'refreshToken', // Only refresh token is httpOnly
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict' as const,
            path: '/',
          };

          // Parse max-age
          const maxAgeAttr = attributes.find(attr => attr.trim().startsWith('Max-Age='));
          if (maxAgeAttr) {
            cookieOptions.maxAge = parseInt(maxAgeAttr.split('=')[1]);
          }

          cookieStore.set(name, value, cookieOptions);
        }
      }
    }

    // Implement role-based redirect logic with security validation
    const userRole = data.data?.user?.role;
    const formRedirectTo = formData.get('redirectTo') as string;

    let redirectTo: string;

    if (formRedirectTo && formRedirectTo !== '/login') {
      // SECURITY: Validate redirect URL based on user role
      const validatedRedirect = validateRedirectForRole(formRedirectTo, userRole);
      redirectTo = validatedRedirect || (userRole === 'ADMIN' ? '/admin' : '/');
    } else {
      // Default redirect based on user role
      if (userRole === 'ADMIN') {
        redirectTo = '/admin';
      } else {
        redirectTo = '/';
      }
    }

    // Server-side redirect - instant navigation without loading states
    redirect(redirectTo);
  } catch (error) {
    // Don't catch redirect errors - let them bubble up
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.includes('NEXT_REDIRECT')
    ) {
      throw error;
    }

    // Return error state for client to handle
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new Error(`Validation error: ${fieldErrors}`);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error('An unexpected error occurred during login');
  }
}

/**
 * Server action for user registration
 * Provides instant registration with server-side redirects
 */
export async function registerAction(formData: FormData) {
  try {
    // Extract and validate form data
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      phone: (formData.get('phone') as string) || undefined,
      profile_image_url: (formData.get('profile_image_url') as string) || undefined,
    };

    const validatedData = RegisterSchema.parse(rawData);
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    // Call backend API
    const response = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed');
    }

    const data: AuthResponse = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Registration failed');
    }

    // Redirect to login page with success message
    redirect('/login?message=Registration successful! Please log in.');
  } catch (error) {
    // Don't catch redirect errors - let them bubble up
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.includes('NEXT_REDIRECT')
    ) {
      throw error;
    }

    // Return error state for client to handle
    if (error instanceof z.ZodError) {
      const fieldErrors = error.issues
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new Error(`Validation error: ${fieldErrors}`);
    }

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error('An unexpected error occurred during registration');
  }
}

/**
 * Server action for user logout
 * Provides instant logout with server-side redirects
 */
export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    // Get tokens from cookies
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    // Call backend logout if we have tokens
    if (accessToken || refreshToken) {
      try {
        await fetch(`${backendUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { authorization: `Bearer ${accessToken}` }),
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        // Continue with logout even if backend call fails
        // Silently handle backend logout errors
      }
    }

    // Clear cookies
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');

    // Server-side redirect to login page
    redirect('/login?message=You have been logged out successfully.');
  } catch (error) {
    // Don't catch redirect errors - let them bubble up
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.includes('NEXT_REDIRECT')
    ) {
      throw error;
    }

    // Even if there's an error, clear cookies and redirect
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    redirect('/login');
  }
}
