import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/api-config';
import {
  decodeJWTPayload,
  getRoleBasedRedirectUrl,
  getRedirectFromRequest
} from '@/lib/server-jwt-decoder';

/**
 * Google OAuth Callback Route
 * Handles the OAuth callback from Google and follows the same pattern as login route
 * - Proxies to backend OAuth callback
 * - Extracts and manages cookies
 * - Implements role-based redirection
 * - Provides proper error handling
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Forward all query parameters to backend callback
    const backendCallbackUrl = new URL(`${API_CONFIG.backend.base}/auth/google/callback`);
    for (const [key, value] of searchParams.entries()) {
      backendCallbackUrl.searchParams.set(key, value);
    }

    // Call backend OAuth callback
    const response = await fetch(backendCallbackUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Handle backend errors
    if (!response.ok) {
      console.error('Backend OAuth callback failed:', response.status, response.statusText);
      
      // Redirect to login with error
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'oauth_error');
      loginUrl.searchParams.set('message', 'Google authentication failed');
      
      return NextResponse.redirect(loginUrl.toString());
    }

    // Check if backend returned a redirect (successful OAuth flow)
    if (response.redirected || response.status === 302) {
      // Backend handled the redirect, but we need to extract cookies and handle them properly
      const setCookieHeaders = response.headers.getSetCookie?.() || [];
      
      let userRole = 'USER';
      let redirectUrl = '/';

      // Extract access token and decode role for proper redirection
      for (const cookieHeader of setCookieHeaders) {
        if (cookieHeader.includes('accessToken=')) {
          const tokenMatch = cookieHeader.match(/accessToken=([^;]+)/);
          if (tokenMatch) {
            const payload = decodeJWTPayload(tokenMatch[1]);
            if (payload?.role) {
              userRole = payload.role;
              const requestedRedirect = getRedirectFromRequest(request);
              redirectUrl = getRoleBasedRedirectUrl(payload.role, requestedRedirect || undefined);
              break;
            }
          }
        }
      }

      // Create redirect response with proper role-based URL
      const frontendRedirectUrl = new URL(redirectUrl, request.url);
      frontendRedirectUrl.searchParams.set('auth', 'success');
      
      // Check if it's a new user (from backend response)
      const backendRedirectUrl = response.headers.get('location') || response.url;
      if (backendRedirectUrl.includes('new_user=true')) {
        frontendRedirectUrl.searchParams.set('new_user', 'true');
      }

      const nextResponse = NextResponse.redirect(frontendRedirectUrl.toString());

      // Set cookies for the frontend (following login route pattern)
      for (const cookieHeader of setCookieHeaders) {
        if (cookieHeader.includes('accessToken=')) {
          const tokenMatch = cookieHeader.match(/accessToken=([^;]+)/);
          if (tokenMatch) {
            nextResponse.cookies.set('accessToken', tokenMatch[1], {
              httpOnly: false, // Allow JavaScript access for API calls
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 15 * 60, // 15 minutes (match backend)
              path: '/',
            });
          }
        } else if (cookieHeader.includes('refreshToken=')) {
          const tokenMatch = cookieHeader.match(/refreshToken=([^;]+)/);
          if (tokenMatch) {
            nextResponse.cookies.set('refreshToken', tokenMatch[1], {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 30 * 24 * 60 * 60, // 30 days
              path: '/',
            });
          }
        } else if (cookieHeader.includes('userInfo=')) {
          const userInfoMatch = cookieHeader.match(/userInfo=([^;]+)/);
          if (userInfoMatch) {
            nextResponse.cookies.set('userInfo', userInfoMatch[1], {
              httpOnly: false, // Allow client access
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 15 * 60, // 15 minutes
              path: '/',
            });
          }
        }
      }

      console.log(`[GOOGLE-OAUTH-CALLBACK] Role-based redirect: ${userRole} -> ${redirectUrl}`);
      return nextResponse;
    }

    // If we get here, something unexpected happened
    console.error('Unexpected OAuth callback response:', response.status);
    
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'oauth_error');
    loginUrl.searchParams.set('message', 'Unexpected authentication response');
    
    return NextResponse.redirect(loginUrl.toString());

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    
    // Redirect to login with error
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'oauth_error');
    loginUrl.searchParams.set('message', 'Authentication failed. Please try again.');
    
    return NextResponse.redirect(loginUrl.toString());
  }
}
