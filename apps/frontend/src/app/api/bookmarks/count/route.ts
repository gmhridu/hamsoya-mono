/**
 * Bookmark Count API Route
 * Fast endpoint for getting bookmark count only
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to get session ID from cookies
async function getSessionId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('session_id')?.value;
}

// GET /api/bookmarks/count - Get bookmark count only
export async function GET(request: NextRequest) {
  try {
    const sessionId = await getSessionId();

    // If no session ID, return 0
    if (!sessionId) {
      return NextResponse.json({ count: 0 });
    }

    // For tRPC queries with input, use GET with query parameters
    const inputData = { sessionId: sessionId };
    const response = await fetch(
      `${BACKEND_URL}/trpc/bookmarks.getCount?input=${encodeURIComponent(
        JSON.stringify(inputData)
      )}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Forward authentication headers
          ...(request.headers.get('authorization') && {
            authorization: request.headers.get('authorization')!,
          }),
        },
      }
    );

    if (!response.ok) {
      // If backend fails, try to get count from cookie
      const cookieStore = await cookies();
      const cookieCount = cookieStore.get('bookmark_count')?.value;
      return NextResponse.json({ count: parseInt(cookieCount || '0', 10) });
    }

    const data = await response.json();
    const count = data.result?.data || 0;

    // Update cookie with latest count
    const cookieStore = cookies();
    cookieStore.set('bookmark_count', count.toString(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Bookmark count error:', error);

    // Fallback to cookie value
    const cookieStore = cookies();
    const cookieCount = cookieStore.get('bookmark_count')?.value;
    return NextResponse.json({ count: parseInt(cookieCount || '0', 10) });
  }
}
