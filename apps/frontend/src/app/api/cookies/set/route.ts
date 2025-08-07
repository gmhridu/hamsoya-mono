import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, value, options } = await request.json();

    if (!name || value === undefined) {
      return NextResponse.json(
        { error: 'Name and value are required' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true });

    // Set the cookie with provided options
    response.cookies.set(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      ...options,
    });

    return response;
  } catch (error) {
    console.error('Error setting cookie:', error);
    return NextResponse.json(
      { error: 'Failed to set cookie' },
      { status: 500 }
    );
  }
}
