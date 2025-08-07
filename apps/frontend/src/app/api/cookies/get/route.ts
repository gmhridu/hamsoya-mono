import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { error: 'Cookie name is required' },
        { status: 400 }
      );
    }

    const value = request.cookies.get(name)?.value || null;

    return NextResponse.json({ value });
  } catch (error) {
    console.error('Error getting cookie:', error);
    return NextResponse.json(
      { error: 'Failed to get cookie' },
      { status: 500 }
    );
  }
}
