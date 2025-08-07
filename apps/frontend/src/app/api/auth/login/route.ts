import { NextRequest, NextResponse } from 'next/server';
import {
  decodeJWTPayload,
  getRoleBasedRedirectUrl,
  getRedirectFromRequest
} from '@/lib/server-jwt-decoder';
import { API_CONFIG } from '@/lib/api-config';
import { getRedirectUrl } from '@/lib/server-navigation';

// User login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Use centralized API configuration
    const fullUrl = API_CONFIG.backend.auth.login;

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.message || 'Login failed',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract role from access token for immediate redirect calculation
    let redirectUrl = '/';
    let userRole = 'USER';

    // Get access token from response to extract role
    const setCookieHeaders = response.headers.getSetCookie?.() || [];
    if (setCookieHeaders.length === 0) {
      const singleSetCookie = response.headers.get('set-cookie');
      if (singleSetCookie) {
        setCookieHeaders.push(singleSetCookie);
      }
    }

    // Extract access token and decode role
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

    // Enhance response data with immediate redirect information
    const enhancedData = {
      ...data,
      redirectUrl,
      userRole,
      immediateRedirect: true, // Flag for client to perform immediate redirect
    };

    // Create response with enhanced user data
    const nextResponse = NextResponse.json(enhancedData);

    // Set cookies for the client (headers already extracted above)

    for (const cookieHeader of setCookieHeaders) {
      if (cookieHeader.includes('accessToken=')) {
        const tokenMatch = cookieHeader.match(/accessToken=([^;]+)/);
        if (tokenMatch) {
          nextResponse.cookies.set('accessToken', tokenMatch[1], {
            httpOnly: false, // Allow JavaScript access for API calls
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 5 * 60, // 5 minutes (match backend)
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
            maxAge: 30 * 24 * 60 * 60, // 30 days = 2,592,000 seconds
            path: '/',
          });
        }
      }
    }

    return nextResponse;
  } catch (error) {
    console.error('Login API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
