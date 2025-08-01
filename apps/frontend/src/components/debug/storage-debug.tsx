/**
 * Storage Debug Component
 * Test and debug cart and bookmark functionality
 * Verify instant loading, persistence, and synchronization
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useServerStorage } from '@/components/providers/enhanced-server-storage-provider';
import { useBookmarksStore } from '@/store/bookmarks-store';
import { useCartStore } from '@/store/cart-store';
import { offlineQueue } from '@/lib/offline-queue';
import { useState, useEffect } from 'react';
import type { Product } from '@/types';

// Mock product for testing
const mockProduct: Product = {
  id: 'test-product-1',
  name: 'Test Product',
  description: 'A test product for debugging',
  price: 29.99,
  originalPrice: 39.99,
  images: ['/placeholder.jpg'],
  category: 'test',
  inStock: true,
  featured: false,
  tags: ['test'],
  weight: '1kg',
  origin: 'Test Origin',
  benefits: ['Test benefit'],
};

export function StorageDebug() {
  const [cookieCounts, setCookieCounts] = useState({ cart: 0, bookmark: 0 });
  const [queueStatus, setQueueStatus] = useState(offlineQueue.getStatus());

  // Server storage
  const serverStorage = useServerStorage();

  // Client stores
  const cartStore = useCartStore();
  const bookmarkStore = useBookmarksStore();

  // Update cookie counts
  useEffect(() => {
    const updateCookieCounts = () => {
      if (typeof window !== 'undefined') {
        const cookies = document.cookie.split(';');
        const cartCookie = cookies.find(c => c.trim().startsWith('cart_count='));
        const bookmarkCookie = cookies.find(c => c.trim().startsWith('bookmark_count='));
        
        setCookieCounts({
          cart: cartCookie ? parseInt(cartCookie.split('=')[1], 10) || 0 : 0,
          bookmark: bookmarkCookie ? parseInt(bookmarkCookie.split('=')[1], 10) || 0 : 0,
        });
      }
    };

    updateCookieCounts();
    const interval = setInterval(updateCookieCounts, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update queue status
  useEffect(() => {
    const updateQueueStatus = () => {
      setQueueStatus(offlineQueue.getStatus());
    };

    updateQueueStatus();
    const interval = setInterval(updateQueueStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const testCartOperations = async () => {
    console.log('Testing cart operations...');
    
    // Add item
    cartStore.addItem(mockProduct, 2);
    
    // Wait a bit then update quantity
    setTimeout(() => {
      cartStore.updateQuantity(mockProduct.id, 3);
    }, 1000);
    
    // Wait a bit then remove item
    setTimeout(() => {
      cartStore.removeItem(mockProduct.id);
    }, 2000);
  };

  const testBookmarkOperations = async () => {
    console.log('Testing bookmark operations...');
    
    // Add bookmark
    bookmarkStore.addBookmark(mockProduct);
    
    // Wait a bit then toggle (remove)
    setTimeout(() => {
      bookmarkStore.toggleBookmark(mockProduct);
    }, 1000);
    
    // Wait a bit then add again
    setTimeout(() => {
      bookmarkStore.addBookmark(mockProduct);
    }, 2000);
  };

  const testSyncOperations = async () => {
    console.log('Testing sync operations...');
    
    // Sync with backend
    await Promise.all([
      cartStore.syncWithBackend(),
      bookmarkStore.syncWithBackend(),
    ]);
  };

  const clearAllData = () => {
    cartStore.clearCart();
    bookmarkStore.clearBookmarks();
    offlineQueue.clearQueue();
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Storage Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={testCartOperations} variant="outline">
              Test Cart Operations
            </Button>
            <Button onClick={testBookmarkOperations} variant="outline">
              Test Bookmark Operations
            </Button>
            <Button onClick={testSyncOperations} variant="outline">
              Test Sync
            </Button>
            <Button onClick={clearAllData} variant="destructive">
              Clear All Data
            </Button>
          </div>

          {/* Status Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Server Storage Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Server Storage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>Cart Items: {serverStorage.cart.totalItems}</div>
                <div>Cart Price: ${serverStorage.cart.totalPrice.toFixed(2)}</div>
                <div>Bookmarks: {serverStorage.bookmarks.bookmarkCount}</div>
                <div>Hydrated: {serverStorage.isHydrated ? '✅' : '❌'}</div>
              </CardContent>
            </Card>

            {/* Client Store Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Client Stores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>Cart Items: {cartStore.getTotalItems()}</div>
                <div>Cart Price: ${cartStore.getTotalPrice().toFixed(2)}</div>
                <div>Bookmarks: {bookmarkStore.getBookmarkCount()}</div>
                <div>Cart Hydrated: {cartStore.isHydrated ? '✅' : '❌'}</div>
                <div>Bookmarks Hydrated: {bookmarkStore.isHydrated ? '✅' : '❌'}</div>
              </CardContent>
            </Card>

            {/* Cookie Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cookie Counts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>Cart Count: {cookieCounts.cart}</div>
                <div>Bookmark Count: {cookieCounts.bookmark}</div>
              </CardContent>
            </Card>

            {/* Queue Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Offline Queue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>Online: {queueStatus.isOnline ? '✅' : '❌'}</div>
                <div>Queue Length: {queueStatus.queueLength}</div>
                <div>Processing: {queueStatus.isProcessing ? '✅' : '❌'}</div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>Page Load: {typeof window !== 'undefined' ? `${performance.now().toFixed(0)}ms` : 'N/A'}</div>
                <div>Hydration: {cartStore.isHydrated && bookmarkStore.isHydrated ? 'Complete' : 'Pending'}</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Data */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cart Items</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto max-h-32">
                  {JSON.stringify(cartStore.items, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Bookmarked Products</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs overflow-auto max-h-32">
                  {JSON.stringify(bookmarkStore.bookmarkedProducts, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
