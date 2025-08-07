import { NextRequest, NextResponse } from 'next/server';

// Refresh access token using refresh token
export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    // Get refresh token from cookies
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token not found' }, { status: 401 });
    }

    // Forward cookies to backend
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(`${backendUrl}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // If refresh token is expired or invalid, clean up cookies
      if (response.status === 401) {
        const cleanupResponse = NextResponse.json(
          {
            error: errorData.message || 'Token refresh failed',
            details: errorData,
          },
          { status: response.status }
        );

        // Delete both tokens to force re-authentication
        cleanupResponse.cookies.delete('accessToken');
        cleanupResponse.cookies.delete('refreshToken');

        return cleanupResponse;
      }

      return NextResponse.json(
        {
          error: errorData.message || 'Token refresh failed',
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Create response
    const nextResponse = NextResponse.json(data);

    // Get all Set-Cookie headers from backend
    const setCookieHeaders = response.headers.getSetCookie?.() || [];

    // If getSetCookie is not available, fall back to the old method
    if (setCookieHeaders.length === 0) {
      const singleSetCookie = response.headers.get('set-cookie');
      if (singleSetCookie) {
        setCookieHeaders.push(singleSetCookie);
      }
    }

    // First, explicitly delete any existing access token to ensure cleanup
    nextResponse.cookies.delete('accessToken');

    // Process each cookie and ensure proper cleanup
    for (const cookieHeader of setCookieHeaders) {
      if (cookieHeader.includes('accessToken=')) {
        const tokenMatch = cookieHeader.match(/accessToken=([^;]+)/);
        if (tokenMatch) {
          // Set new access token with proper expiration
          nextResponse.cookies.set('accessToken', tokenMatch[1], {
            httpOnly: false, // Allow JavaScript access for API calls
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 5 * 60, // 5 minutes (match backend)
            path: '/',
          });
        }
      } else if (cookieHeader.includes('refreshToken=')) {
        const tokenMatch = cookieHeader.match(/refreshToken=([^;]+)/);
        if (tokenMatch) {
          // Set new refresh token
          nextResponse.cookies.set('refreshToken', tokenMatch[1], {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
          });
        }
      }
    }

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
