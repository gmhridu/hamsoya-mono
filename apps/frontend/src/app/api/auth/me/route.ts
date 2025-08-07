import { NextRequest, NextResponse } from 'next/server';
import { API_CONFIG } from '@/lib/api-config';

// Get current user
export async function GET(request: NextRequest) {
  try {
    const backendUrl = API_CONFIG.backend.base;

    // Get access token from cookies
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const response = await fetch(API_CONFIG.backend.auth.me, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // If unauthorized, clear the invalid token
      if (response.status === 401) {
        const nextResponse = NextResponse.json(
          { error: 'Authentication expired' },
          { status: 401 }
        );

        nextResponse.cookies.set('accessToken', '', { maxAge: 0 });
        nextResponse.cookies.set('refreshToken', '', { maxAge: 0 });

        return nextResponse;
      }

      return NextResponse.json(
        {
          error: errorData.message || 'Failed to get user data',
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Get user API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
