import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/server-auth';
import { Navbar } from './navbar-client';

/**
 * Server component that reads cart and bookmark counts from cookies
 * and gets server-side user data to pass to the client-side navbar component for SSR
 * This prevents navbar flashing by providing immediate user state
 */
export async function NavbarServer() {
  // Read counts from cookies on the server-side
  const cookieStore = await cookies();

  // Get cart count from cookie, fallback to 0
  const cartCountCookie = cookieStore.get('cart_count')?.value;
  const cartCount = cartCountCookie ? parseInt(cartCountCookie, 10) : 0;

  // Get bookmark count from cookie, fallback to 0
  const bookmarkCountCookie = cookieStore.get('bookmark_count')?.value;
  const bookmarkCount = bookmarkCountCookie ? parseInt(bookmarkCountCookie, 10) : 0;

  // Ensure counts are valid numbers (not NaN)
  const safeCartCount = isNaN(cartCount) ? 0 : cartCount;
  const safeBookmarkCount = isNaN(bookmarkCount) ? 0 : bookmarkCount;

  // Get server-side user data to prevent navbar flashing
  const { user, isAuthenticated } = await getCurrentUser();

  return (
    <Navbar
      initialCartCount={safeCartCount}
      initialBookmarkCount={safeBookmarkCount}
      serverUser={user}
      serverIsAuthenticated={isAuthenticated}
    />
  );
}
