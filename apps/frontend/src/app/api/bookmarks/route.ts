/**
 * Bookmarks API Routes
 * Handles bookmark operations with Redis storage and cookie-based count storage
 */

import { createTRPCProxyClient, httpLink } from '@trpc/client';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import superjson from 'superjson';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create a server-side tRPC client
const trpcClient = createTRPCProxyClient<any>({
  transformer: superjson,
  links: [
    httpLink({
      url: `${BACKEND_URL}/trpc`,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ],
});

// Helper function to get session ID from cookies or generate new one
async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('session_id')?.value;

  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  return sessionId;
}

// Helper function to set bookmark count cookie
async function setBookmarkCountCookie(count: number) {
  const cookieStore = await cookies();
  cookieStore.set('bookmark_count', count.toString(), {
    httpOnly: false, // Allow client-side access for instant display
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

// Helper function to set session ID cookie
async function setSessionIdCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set('session_id', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

// GET /api/bookmarks - Get bookmark data
export async function GET(request: NextRequest) {
  try {
    const sessionId = await getOrCreateSessionId();

    // TODO: Use tRPC client to call the backend
    // const data = await trpcClient.bookmarks.get.query({ sessionId });
    const data = { bookmarkedProducts: [], count: 0 };

    // Set cookies for instant display
    await setSessionIdCookie(sessionId);
    await setBookmarkCountCookie(data.count || 0);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Bookmarks GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmark data' }, { status: 500 });
  }
}

// POST /api/bookmarks - Add bookmark
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product } = body;
    const sessionId = await getOrCreateSessionId();

    // TODO: Use tRPC client to call the backend
    // const data = await trpcClient.bookmarks.add.mutate({ product, sessionId });
    const data = { count: 1, bookmarkedProducts: [product] };

    // Set cookies for instant display
    await setSessionIdCookie(sessionId);
    await setBookmarkCountCookie(data.count || 0);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Bookmarks POST error:', error);
    return NextResponse.json({ error: 'Failed to add bookmark' }, { status: 500 });
  }
}

// PUT /api/bookmarks - Toggle bookmark
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { product } = body;
    const sessionId = await getOrCreateSessionId();

    // TODO: Use tRPC client to call the backend
    // const data = await trpcClient.bookmarks.toggle.mutate({ product, sessionId });
    const data = { count: 0, bookmarkedProducts: [] };

    // Set cookies for instant display
    await setSessionIdCookie(sessionId);
    await setBookmarkCountCookie(data.count || 0);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Bookmarks PUT error:', error);
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 });
  }
}

// DELETE /api/bookmarks - Remove bookmark or clear all
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const clear = searchParams.get('clear') === 'true';
    const sessionId = await getOrCreateSessionId();

    // TODO: Use tRPC client to call the backend
    let data;

    if (clear) {
      // data = await trpcClient.bookmarks.clear.mutate({ sessionId });
      data = { count: 0, bookmarkedProducts: [] };
    } else if (productId) {
      // data = await trpcClient.bookmarks.remove.mutate({ productId, sessionId });
      data = { count: 0, bookmarkedProducts: [] };
    } else {
      return NextResponse.json(
        { error: 'Either productId or clear=true must be provided' },
        { status: 400 }
      );
    }

    // Set cookies for instant display
    await setSessionIdCookie(sessionId);
    await setBookmarkCountCookie(data.count || 0);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Bookmarks DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove bookmark' }, { status: 500 });
  }
}
