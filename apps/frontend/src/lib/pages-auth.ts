import type { User } from '@/types/auth';
import jwt from 'jsonwebtoken';
import { GetServerSidePropsContext } from 'next';

export interface PageAuthResult {
  user: User | null;
  isAuthenticated: boolean;
}

export interface PageRedirectResult {
  redirect: {
    destination: string;
    permanent: boolean;
  };
}

export interface PageAuthSuccess {
  auth: PageAuthResult;
}

/**
 * Get authentication status for Pages Router
 */
export async function getPageAuth(context: GetServerSidePropsContext): Promise<PageAuthResult> {
  try {
    const cookieHeader = context.req.headers.cookie || '';
    const cookies = parseCookies(cookieHeader);
    const accessToken = cookies.accessToken;

    if (!accessToken) {
      return { user: null, isAuthenticated: false };
    }

    // Get JWT secret from environment
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessSecret) {
      return { user: null, isAuthenticated: false };
    }

    // Verify the JWT token
    const decoded = jwt.verify(accessToken, accessSecret, {
      algorithms: ['HS256'],
    }) as any;

    // Validate token structure
    if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
      return { user: null, isAuthenticated: false };
    }

    // Extract user data from token - ensure all values are JSON serializable
    const user: User = {
      id: decoded.userId,
      name: decoded.name || '',
      email: decoded.email || '',
      role: decoded.role || 'USER',
      is_verified: decoded.is_verified || false,
      created_at: decoded.created_at || new Date().toISOString(),
    };

    // Only add optional fields if they exist and are not undefined
    if (decoded.phone_number) {
      user.phone_number = decoded.phone_number;
    }
    if (decoded.profile_image_url) {
      user.profile_image_url = decoded.profile_image_url;
    }
    if (decoded.updated_at) {
      user.updated_at = decoded.updated_at;
    }

    return { user, isAuthenticated: true };
  } catch (error) {
    return { user: null, isAuthenticated: false };
  }
}

/**
 * Parse cookies from cookie header string
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Require authentication for Pages Router
 * Returns redirect object if not authenticated
 */
export async function requireAuth(
  context: GetServerSidePropsContext
): Promise<PageAuthSuccess | PageRedirectResult> {
  const auth = await getPageAuth(context);

  if (!auth.isAuthenticated) {
    const redirectTo = context.resolvedUrl;
    const loginUrl = `/login?redirect=${encodeURIComponent(redirectTo)}`;

    return {
      redirect: {
        destination: loginUrl,
        permanent: false,
      },
    };
  }

  return { auth };
}

/**
 * Require guest (unauthenticated) for Pages Router
 * Returns redirect object if authenticated
 */
export async function requireGuest(
  context: GetServerSidePropsContext
): Promise<PageAuthSuccess | PageRedirectResult> {
  const auth = await getPageAuth(context);

  if (auth.isAuthenticated) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return { auth };
}

/**
 * Optional authentication for Pages Router
 * Always returns auth result, never redirects
 */
export async function optionalAuth(context: GetServerSidePropsContext): Promise<PageAuthSuccess> {
  const auth = await getPageAuth(context);
  return { auth };
}

/**
 * Type guards for checking auth results
 */
export function isRedirectResult(
  result: PageAuthSuccess | PageRedirectResult
): result is PageRedirectResult {
  return 'redirect' in result;
}

export function isAuthSuccess(
  result: PageAuthSuccess | PageRedirectResult
): result is PageAuthSuccess {
  return 'auth' in result;
}
