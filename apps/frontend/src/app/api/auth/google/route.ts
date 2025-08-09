import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/api-config';

/**
 * Google OAuth Initiation Route
 * Follows the same pattern as other auth endpoints by proxying to backend
 */
export async function GET(request: NextRequest) {
  try {
    // Get redirectTo parameter from query string
    const { searchParams } = new URL(request.url);
    const redirectTo = searchParams.get('redirectTo');

    // Construct backend OAuth URL
    const backendOAuthUrl = new URL(`${API_CONFIG.backend.base}/auth/google`);
    
    // Forward redirectTo parameter if provided
    if (redirectTo) {
      backendOAuthUrl.searchParams.set('redirectTo', redirectTo);
    }

    // Forward any other query parameters
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'redirectTo') {
        backendOAuthUrl.searchParams.set(key, value);
      }
    }

    // Redirect to backend OAuth endpoint
    // This will initiate the Google OAuth flow
    return NextResponse.redirect(backendOAuthUrl.toString());

  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    
    // Redirect to login with error
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'oauth_error');
    loginUrl.searchParams.set('message', 'Failed to initiate Google authentication');
    
    return NextResponse.redirect(loginUrl.toString());
  }
}
