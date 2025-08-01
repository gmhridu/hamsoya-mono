import { cookies } from 'next/headers';

export default async function TestSSRPage() {
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">SSR Test Page</h1>
      <div className="space-y-2">
        <p>Cart Count (from cookie): <span className="font-bold text-blue-600">{safeCartCount}</span></p>
        <p>Bookmark Count (from cookie): <span className="font-bold text-green-600">{safeBookmarkCount}</span></p>
        <p className="text-sm text-gray-500">These values are read server-side from cookies</p>
      </div>
    </div>
  );
}
