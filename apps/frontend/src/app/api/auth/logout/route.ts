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
    
    // Clear authentication cookies
    response.cookies.set('accessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    });
    
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    });
    
    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    
    // Even if there's an error, clear the cookies
    const response = NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    
    response.cookies.set('accessToken', '', { maxAge: 0 });
    response.cookies.set('refreshToken', '', { maxAge: 0 });
    
    return response;
  }
}
