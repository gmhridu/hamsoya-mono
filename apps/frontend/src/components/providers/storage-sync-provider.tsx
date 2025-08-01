'use client';

import { useEffect } from 'react';
import { ENHANCED_STORAGE_CONFIG } from '@/lib/enhanced-guest-storage';

/**
 * Storage Sync Provider
 * Automatically syncs localStorage to cookies for server-side reading
 * Ensures server-side storage data is always up-to-date
 */
export function StorageSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Function to sync localStorage to cookies
    const syncStorageToServer = () => {
      try {
        const cartData = localStorage.getItem(ENHANCED_STORAGE_CONFIG.KEYS.CART);
        const bookmarksData = localStorage.getItem(ENHANCED_STORAGE_CONFIG.KEYS.BOOKMARKS);
        
        // Set cookies with 30-day expiration
        const cookieOptions = 'path=/; max-age=' + (30 * 24 * 60 * 60) + '; SameSite=Lax';
        
        if (cartData) {
          document.cookie = `${ENHANCED_STORAGE_CONFIG.KEYS.CART}=${encodeURIComponent(cartData)}; ${cookieOptions}`;
        }
        
        if (bookmarksData) {
          document.cookie = `${ENHANCED_STORAGE_CONFIG.KEYS.BOOKMARKS}=${encodeURIComponent(bookmarksData)}; ${cookieOptions}`;
        }
      } catch (error) {
        console.warn('Failed to sync storage to server:', error);
      }
    };

    // Initial sync
    syncStorageToServer();

    // Sync on storage changes (from other tabs)
    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === ENHANCED_STORAGE_CONFIG.KEYS.CART ||
        event.key === ENHANCED_STORAGE_CONFIG.KEYS.BOOKMARKS
      ) {
        syncStorageToServer();
      }
    };

    // Sync on page visibility change (when user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncStorageToServer();
      }
    };

    // Sync before page unload
    const handleBeforeUnload = () => {
      syncStorageToServer();
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Periodic sync every 30 seconds to ensure data is always fresh
    const syncInterval = setInterval(syncStorageToServer, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(syncInterval);
    };
  }, []);

  return <>{children}</>;
}
