import { NextRequest, NextResponse } from 'next/server';

// User logout
export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // Get tokens from cookies
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // Call backend logout if we have tokens
    if (accessToken || refreshToken) {
      try {
        await fetch(`${backendUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken && { authorization: `Bearer ${accessToken}` }),
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        // Continue with logout even if backend call fails
        console.warn('Backend logout failed:', error);
      }
    }

    // Create response
    const response = NextResponse.json({ message: 'Logged out successfully' });

    // Clear authentication cookies (hybrid approach)
    // Access token: Clear non-httpOnly cookie
    response.cookies.set('accessToken', '', {
      httpOnly: false, // Match the login cookie setting
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    // Refresh token: Clear httpOnly cookie
    response.cookies.set('refreshToken', '', {
      httpOnly: true, // Keep httpOnly for security
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout API error:', error);

    // Even if there's an error, clear the cookies
    const response = NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );

    response.cookies.set('accessToken', '', {
      httpOnly: false,
      maxAge: 0,
      path: '/',
    });
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    return response;
  }
}
