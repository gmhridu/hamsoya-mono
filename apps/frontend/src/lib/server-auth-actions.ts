/**
 * Server Authentication Actions
 * Provides instant server-side authentication and redirects for ChatGPT-style performance
 * Separates server-side logic from client-side form handling
 */

'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/lib/api-config';

export interface LoginCredentials {
  email: string;
  password: string;
  redirectTo?: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  profile_image_url?: string;
  redirectTo?: string;
}

/**
 * Get role-based redirect URL with security validation
 */
function getRoleBasedRedirectUrl(role: string, requestedRedirect?: string): string {
  // Validate requested redirect for security
  if (requestedRedirect && requestedRedirect !== '/login') {
    // Basic security check - ensure it's a relative path
    if (requestedRedirect.startsWith('/') && !requestedRedirect.startsWith('//')) {
      // Additional role-based validation
      if (role === 'ADMIN' && requestedRedirect.startsWith('/admin')) {
        return requestedRedirect;
      } else if (role !== 'ADMIN' && !requestedRedirect.startsWith('/admin')) {
        return requestedRedirect;
      }
    }
  }

  // Default role-based redirects
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'SELLER':
      return '/dashboard';
    default:
      return '/';
  }
}

/**
 * Extract and set authentication cookies from response
 */
async function setAuthCookies(response: Response): Promise<void> {
  const setCookieHeaders = response.headers.getSetCookie?.() || [];
  if (setCookieHeaders.length === 0) {
    const singleSetCookie = response.headers.get('set-cookie');
    if (singleSetCookie) {
      setCookieHeaders.push(singleSetCookie);
    }
  }

  const cookieStore = await cookies();
  for (const cookieHeader of setCookieHeaders) {
    const [nameValue] = cookieHeader.split(';');
    const [name, value] = nameValue.split('=');
    if (name && value) {
      cookieStore.set(name.trim(), value.trim(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });
    }
  }
}

/**
 * Server action for instant login with server-side redirects
 * Eliminates client-side navigation for optimal performance
 */
export async function serverLoginAction(credentials: LoginCredentials): Promise<never> {
  const { email, password, redirectTo } = credentials;

  if (!email || !password) {
    redirect('/login?error=Missing email or password');
  }

  try {
    console.log('[SERVER-LOGIN] Starting login process for:', email);

    // Call backend API for authentication
    const response = await fetch(API_CONFIG.backend.auth.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || 'Login failed';
      console.log('[SERVER-LOGIN] Login failed:', errorMessage);
      redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }

    // Set authentication cookies from response
    await setAuthCookies(response);

    // Get user data and determine redirect
    const data = await response.json();
    if (data.success && data.data?.user) {
      const user = data.data.user;
      const finalRedirectUrl = getRoleBasedRedirectUrl(user.role, redirectTo);

      console.log(`[SERVER-LOGIN] Login successful, redirecting ${user.role} to: ${finalRedirectUrl}`);

      // Instant server-side redirect
      redirect(finalRedirectUrl);
    }

    // Fallback redirect
    console.log('[SERVER-LOGIN] No user data, redirecting to home');
    redirect('/');
  } catch (error) {
    // Check if this is a NEXT_REDIRECT error (expected behavior)
    if (error && typeof error === 'object' && 'digest' in error &&
        typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      // This is the expected redirect behavior, re-throw it
      throw error;
    }

    console.error('[SERVER-LOGIN] Server login error:', error);
    redirect('/login?error=Login failed. Please try again.');
  }
}

/**
 * Server action for user registration
 * Handles registration and redirects to verification page
 */
export async function serverRegisterAction(credentials: RegisterCredentials): Promise<never> {
  const { name, email, password, phone_number, profile_image_url, redirectTo } = credentials;

  if (!name || !email || !password) {
    redirect('/login?error=Missing required fields');
  }

  try {
    const response = await fetch(API_CONFIG.backend.auth.register, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        phone_number,
        profile_image_url,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || 'Registration failed';
      redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }

    const data = await response.json();

    if (data.success) {
      // Redirect to email verification page
      const verifyUrl = `/verify-email?email=${encodeURIComponent(email)}`;
      redirect(verifyUrl);
    } else {
      const errorMessage = data.error || data.message || 'Registration failed';
      redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }
  } catch (error) {
    console.error('Server registration error:', error);
    redirect('/login?error=Registration failed. Please try again.');
  }
}

/**
 * FormData wrapper for login action
 * Converts FormData to typed credentials for compatibility
 */
export async function serverLoginFormAction(formData: FormData): Promise<never> {
  try {
    const credentials: LoginCredentials = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirectTo: formData.get('redirectTo') as string || undefined,
    };

    return await serverLoginAction(credentials);
  } catch (error) {
    // Re-throw NEXT_REDIRECT errors to allow proper redirects
    if (error && typeof error === 'object' && 'digest' in error &&
        typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    // Handle other errors
    console.error('[SERVER-LOGIN-FORM] Form action error:', error);
    redirect('/login?error=Login failed. Please try again.');
  }
}

/**
 * FormData wrapper for register action
 * Converts FormData to typed credentials for compatibility
 */
export async function serverRegisterFormAction(formData: FormData): Promise<never> {
  const credentials: RegisterCredentials = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    phone_number: formData.get('phone_number') as string || undefined,
    profile_image_url: formData.get('profile_image_url') as string || undefined,
    redirectTo: formData.get('redirectTo') as string || undefined,
  };

  return serverRegisterAction(credentials);
}

/**
 * Instant role-based redirect using JWT token
 * Decodes JWT and redirects user before HTML loads
 */
export async function instantRoleBasedRedirect(redirectTo?: string): Promise<never> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (accessToken) {
      // Fast JWT decode without verification for role extraction
      const { decodeJWTPayload } = await import('@/lib/server-jwt-decoder');
      const payload = decodeJWTPayload(accessToken);

      if (payload && payload.role) {
        const finalRedirectUrl = getRoleBasedRedirectUrl(payload.role, redirectTo);
        console.log(`[INSTANT-REDIRECT] ${payload.role} user -> ${finalRedirectUrl}`);
        redirect(finalRedirectUrl);
      }
    }

    // No valid token, redirect to login
    redirect('/login');
  } catch (error) {
    console.error('Instant redirect error:', error);
    redirect('/login');
  }
}
