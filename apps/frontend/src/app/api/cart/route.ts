/**
 * Cart API Routes
 * Handles cart operations with Redis storage and cookie-based count storage
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

// Helper function to set cart count cookie
async function setCartCountCookie(count: number) {
  const cookieStore = await cookies();
  cookieStore.set('cart_count', count.toString(), {
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

// GET /api/cart - Get cart data
export async function GET(request: NextRequest) {
  try {
    const sessionId = await getOrCreateSessionId();

    // TODO: Use tRPC client to call the backend
    // const data = await trpcClient.cart.get.query({ sessionId });
    const data = { items: [], count: 0, totalPrice: 0 };

    // Set cookies for instant display
    await setSessionIdCookie(sessionId);
    await setCartCountCookie(data.count || 0);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart data' }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, quantity = 1 } = body;
    const sessionId = await getOrCreateSessionId();

    // TODO: Use tRPC client to call the backend
    // const data = await trpcClient.cart.addItem.mutate({ product, quantity, sessionId });
    const data = { items: [{ product, quantity }], count: quantity, totalPrice: product.price * quantity };

    // Set cookies for instant display
    await setSessionIdCookie(sessionId);
    await setCartCountCookie(data.count || 0);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
  }
}

// PUT /api/cart - Update item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity } = body;
    const sessionId = await getOrCreateSessionId();

    // TODO: Use tRPC client to call the backend
    // const data = await trpcClient.cart.updateQuantity.mutate({ productId, quantity, sessionId });
    const data = { items: [], count: quantity, totalPrice: 0 };

    // Set cookies for instant display
    await setSessionIdCookie(sessionId);
    await setCartCountCookie(data.count || 0);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Cart PUT error:', error);
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
  }
}

// DELETE /api/cart - Remove item or clear cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const clear = searchParams.get('clear') === 'true';
    const sessionId = await getOrCreateSessionId();

    // TODO: Use tRPC client to call the backend
    let data;

    if (clear) {
      // data = await trpcClient.cart.clearCart.mutate({ sessionId });
      data = { items: [], count: 0, totalPrice: 0 };
    } else if (productId) {
      // data = await trpcClient.cart.removeItem.mutate({ productId, sessionId });
      data = { items: [], count: 0, totalPrice: 0 };
    } else {
      return NextResponse.json(
        { error: 'Either productId or clear=true must be provided' },
        { status: 400 }
      );
    }

    // Set cookies for instant display
    await setSessionIdCookie(sessionId);
    await setCartCountCookie(data.count || 0);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Cart DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove cart item' }, { status: 500 });
  }
}
