/**
 * Server-Side Login Form
 * Uses server actions for instant navigation without client-side JavaScript
 * Provides ChatGPT-style performance with zero loading states
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { API_CONFIG } from '@/lib/api-config';
import { redirectAfterLogin } from '@/lib/server-navigation';

/**
 * Enhanced server action for instant login with server-side redirects
 */
async function loginAction(formData: FormData) {
  'use server';

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = formData.get('redirectTo') as string;

  if (!email || !password) {
    redirect('/login?error=Missing email or password');
  }

  try {
    // Call backend API with redirect parameter for server-side redirect
    const loginUrl = new URL(API_CONFIG.backend.auth.login);
    loginUrl.searchParams.set('redirect', 'true');
    if (redirectTo) {
      loginUrl.searchParams.set('redirectTo', redirectTo);
    }

    const response = await fetch(loginUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/html', // Signal that we want HTML redirect
      },
      body: JSON.stringify({ email, password }),
      redirect: 'manual', // Handle redirects manually
    });

    // Handle server-side redirect response
    if (response.status === 302) {
      const location = response.headers.get('location');
      if (location) {
        console.log('[SERVER-LOGIN] Server-side redirect to:', location);

        // Extract cookies from response and set them
        const setCookieHeaders = response.headers.getSetCookie?.() || [];
        if (setCookieHeaders.length === 0) {
          const singleSetCookie = response.headers.get('set-cookie');
          if (singleSetCookie) {
            setCookieHeaders.push(singleSetCookie);
          }
        }

        // Set cookies in Next.js
        const cookieStore = cookies();
        for (const cookieHeader of setCookieHeaders) {
          const [nameValue, ...attributes] = cookieHeader.split(';');
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

        // Perform instant redirect
        redirect(location);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || 'Login failed';
      redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }

    // Fallback: Extract cookies from JSON response
    const data = await response.json();
    const setCookieHeaders = response.headers.getSetCookie?.() || [];
    if (setCookieHeaders.length === 0) {
      const singleSetCookie = response.headers.get('set-cookie');
      if (singleSetCookie) {
        setCookieHeaders.push(singleSetCookie);
      }
    }

    // Set cookies
    const cookieStore = await cookies();
    for (const cookieHeader of setCookieHeaders) {
      if (cookieHeader.includes('accessToken=')) {
        const tokenMatch = cookieHeader.match(/accessToken=([^;]+)/);
        if (tokenMatch) {
          cookieStore.set('accessToken', tokenMatch[1], {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 5 * 60, // 5 minutes
            path: '/',
          });
        }
      } else if (cookieHeader.includes('refreshToken=')) {
        const tokenMatch = cookieHeader.match(/refreshToken=([^;]+)/);
        if (tokenMatch) {
          cookieStore.set('refreshToken', tokenMatch[1], {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
          });
        }
      }
    }

    // Redirect after successful login
    await redirectAfterLogin(redirectTo);
  } catch (error) {
    console.error('Login error:', error);
    redirect('/login?error=Login failed. Please try again.');
  }
}

/**
 * Server-side login form component
 */
export default function ServerLoginForm({
  redirectTo,
  error
}: {
  redirectTo?: string;
  error?: string;
}) {
  return (
    <div className="w-full max-w-md mx-auto">
      <form action={loginAction} className="space-y-6">
        {/* Hidden redirect field */}
        {redirectTo && (
          <input type="hidden" name="redirectTo" value={redirectTo} />
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
        </div>

        {/* Password field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Sign In
        </button>
      </form>

      {/* Additional links */}
      <div className="mt-6 text-center">
        <a
          href="/forgot-password"
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Forgot your password?
        </a>
      </div>

      <div className="mt-4 text-center">
        <span className="text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:text-blue-500">
            Sign up
          </a>
        </span>
      </div>
    </div>
  );
}

/**
 * Server action for logout
 */
export async function logoutAction() {
  'use server';

  try {
    // Clear cookies
    const cookieStore = await cookies();
    cookieStore.set('accessToken', '', { maxAge: 0 });
    cookieStore.set('refreshToken', '', { maxAge: 0 });

    // Call backend logout
    const accessToken = cookieStore.get('accessToken')?.value;
    if (accessToken) {
      try {
        await fetch(API_CONFIG.backend.auth.logout, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error) {
        console.warn('Backend logout failed:', error);
      }
    }
  } catch (error) {
    console.error('Logout error:', error);
  }

  redirect('/login');
}

/**
 * Logout button component
 */
export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={className || "text-red-600 hover:text-red-500"}
      >
        Logout
      </button>
    </form>
  );
}
