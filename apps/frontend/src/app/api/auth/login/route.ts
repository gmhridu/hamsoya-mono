import { NextRequest, NextResponse } from 'next/server';

// User login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const response = await fetch(`${backendUrl}/api/auth/login`, {
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

    // Create response with user data
    const nextResponse = NextResponse.json(data);

    // Extract cookies from backend response and set them for the client
    // Get all Set-Cookie headers (there might be multiple)
    const setCookieHeaders = response.headers.getSetCookie?.() || [];

    // If getSetCookie is not available, fall back to the old method
    if (setCookieHeaders.length === 0) {
      const singleSetCookie = response.headers.get('set-cookie');
      if (singleSetCookie) {
        setCookieHeaders.push(singleSetCookie);
      }
    }

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
