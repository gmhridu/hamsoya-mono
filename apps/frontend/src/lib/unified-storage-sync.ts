'use client';

import { ENHANCED_STORAGE_CONFIG } from './enhanced-guest-storage';

class UnifiedStorageSync {
  private syncTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private lastSyncData: Record<string, string> = {};

  /**
   * Initialize the storage sync system
   */
  initialize(): void {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    // Initial sync
    this.syncToServer();

    // Set up event listeners
    this.setupEventListeners();

    // Set up periodic sync (reduced frequency)
    this.setupPeriodicSync();
  }

  /**
   * Sync localStorage data to cookies immediately
   */
  syncToServer(): void {
    if (typeof window === 'undefined') return;

    try {
      const storageKeys = [
        'hamsoya-cart-v2',
        'hamsoya-bookmarks-v2',
        ENHANCED_STORAGE_CONFIG.KEYS.CART,
        ENHANCED_STORAGE_CONFIG.KEYS.BOOKMARKS,
      ];

      let hasChanges = false;
      const currentData: Record<string, string> = {};

      storageKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          currentData[key] = data;
          // Only sync if data has changed
          if (this.lastSyncData[key] !== data) {
            this.setCookie(key, data);
            hasChanges = true;
          }
        }
      });

      // Update last sync data only if there were changes
      if (hasChanges) {
        this.lastSyncData = { ...currentData };
      }
    } catch (error) {
      // Silent error handling - no console spam
    }
  }

  /**
   * Set cookie with proper options
   */
  private setCookie(key: string, value: string): void {
    try {
      const cookieOptions = [
        'path=/',
        `max-age=${30 * 24 * 60 * 60}`, // 30 days
        'SameSite=Lax',
      ].join('; ');

      const encodedValue = encodeURIComponent(value);
      const cookieString = `${key}=${encodedValue}; ${cookieOptions}`;

      // Skip if cookie would exceed size limit
      if (cookieString.length > 4096) {
        return;
      }

      document.cookie = cookieString;
    } catch (error) {
      // Silent error handling
    }
  }


  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Sync on storage changes (from other tabs)
    window.addEventListener('storage', event => {
      if (this.isStorageKey(event.key)) {
        this.syncToServer();
      }
    });

    // Sync on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.syncToServer();
      }
    });

    // Sync before page unload
    window.addEventListener('beforeunload', () => {
      this.syncToServer();
    });

    // Sync on focus (when user returns to tab)
    window.addEventListener('focus', () => {
      this.syncToServer();
    });
  }

  /**
   * Set up periodic sync with reasonable interval
   */
  private setupPeriodicSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    // Reasonable sync interval - every 30 seconds
    this.syncTimer = setInterval(() => {
      this.syncToServer();
    }, 30000); // Sync every 30 seconds
  }

  /**
   * Check if a key is one of our storage keys
   */
  private isStorageKey(key: string | null): boolean {
    if (!key) return false;

    return [
      'hamsoya-cart-v2',
      'hamsoya-bookmarks-v2',
      ENHANCED_STORAGE_CONFIG.KEYS.CART,
      ENHANCED_STORAGE_CONFIG.KEYS.BOOKMARKS,
    ].includes(key);
  }

  /**
   * Force sync now (for manual triggering)
   */
  forceSyncNow(): void {
    this.syncToServer();
  }

  /**
   * Trigger sync when store data changes
   */
  onStoreChange(): void {
    // Single sync when data changes - no multiple attempts
    this.syncToServer();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.isInitialized = false;

    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', this.syncToServer);
      document.removeEventListener('visibilitychange', this.syncToServer);
      window.removeEventListener('beforeunload', this.syncToServer);
      window.removeEventListener('focus', this.syncToServer);
    }
  }
}

// Create singleton instance
export const unifiedStorageSync = new UnifiedStorageSync();

/**
 * Initialize storage sync system
 * Call this once when the app starts
 */
export function initializeStorageSync(): void {
  unifiedStorageSync.initialize();
}

/**
 * Force sync storage to server immediately
 */
export function forceSyncStorage(): void {
  unifiedStorageSync.forceSyncNow();
}

/**
 * Trigger sync when store data changes
 */
export function onStoreDataChange(): void {
  unifiedStorageSync.onStoreChange();
}

/**
 * React hook for storage sync
 */
export function useStorageSync() {
  const initialize = () => unifiedStorageSync.initialize();
  const forceSync = () => unifiedStorageSync.forceSyncNow();
  const destroy = () => unifiedStorageSync.destroy();

  return {
    initialize,
    forceSync,
    destroy,
  };
}

/**
 * Storage sync component (zero useEffect approach)
 */
export function StorageSyncInitializer() {
  // Initialize immediately during render (no useEffect)
  if (typeof window !== 'undefined') {
    // Use a global flag to ensure this only runs once
    if (!globalThis.__storageSyncInitialized) {
      globalThis.__storageSyncInitialized = true;

      // Initialize the sync system
      unifiedStorageSync.initialize();

      // Force immediate sync of any existing localStorage data
      setTimeout(() => {
        unifiedStorageSync.forceSyncNow();
      }, 100); // Small delay to ensure localStorage is ready
    }
  }

  return null;
}

// Global flag declaration
declare global {
  var __storageSyncInitialized: boolean | undefined;
}
