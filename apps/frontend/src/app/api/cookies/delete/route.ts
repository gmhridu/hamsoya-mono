import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Cookie name is required' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true });

    // Delete the cookie by setting it with a past expiration date
    response.cookies.set(name, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Error deleting cookie:', error);
    return NextResponse.json(
      { error: 'Failed to delete cookie' },
      { status: 500 }
    );
  }
}
