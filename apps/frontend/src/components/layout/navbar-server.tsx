import { cookies } from 'next/headers';
import { Navbar } from './navbar-client';

/**
 * Server component that reads cart and bookmark counts from cookies
 * and passes them to the client-side navbar component for SSR
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

  return <Navbar initialCartCount={safeCartCount} initialBookmarkCount={safeBookmarkCount} />;
}
