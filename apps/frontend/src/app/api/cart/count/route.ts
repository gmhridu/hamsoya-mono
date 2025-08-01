/**
 * Cart Count API Route
 * Fast endpoint for getting cart count only
 */

import { createTRPCProxyClient, httpLink } from '@trpc/client';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import superjson from 'superjson';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

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

// Helper function to get session ID from cookies
async function getSessionId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get('session_id')?.value;
}

// GET /api/cart/count - Get cart count only
export async function GET(request: NextRequest) {
  try {
    const sessionId = await getSessionId();

    // If no session ID, return 0
    if (!sessionId) {
      return NextResponse.json({ count: 0 });
    }

    // Use tRPC client to call the backend
    let count = 0;
    try {
      const data = await trpcClient.cart.getCount.query({ sessionId });
      count = data || 0;
    } catch (error) {
      // If backend fails, try to get count from cookie
      const cookieStore = await cookies();
      const cookieCount = cookieStore.get('cart_count')?.value;
      count = parseInt(cookieCount || '0', 10);
    }

    // Update cookie with latest count
    const cookieStore = cookies();
    cookieStore.set('cart_count', count.toString(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Cart count error:', error);

    // Fallback to cookie value
    const cookieStore = cookies();
    const cookieCount = cookieStore.get('cart_count')?.value;
    return NextResponse.json({ count: parseInt(cookieCount || '0', 10) });
  }
}
