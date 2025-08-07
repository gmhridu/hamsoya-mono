import type { ServerBookmarksData } from '@/lib/server-storage';
import { bookmarksStorage } from '@/lib/storage-sync';
import { Product } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BookmarksStore {
  bookmarkedProducts: Product[];
  isHydrated: boolean;

  // Actions
  addBookmark: (product: Product) => void;
  removeBookmark: (productId: string) => void;
  toggleBookmark: (product: Product) => void;
  clearBookmarks: () => void;

  // Server-side hydration
  initializeFromServer: (serverData: ServerBookmarksData) => void;
  syncWithBackend: () => Promise<void>;

  // Migration methods
  migrateGuestBookmarks: (authenticatedBookmarks: Product[]) => Product[];
  clearGuestData: () => void;

  // Computed values
  isBookmarked: (productId: string) => boolean;
  getBookmarkCount: () => number;

  // Internal hydration
  _setHydrated: (hydrated: boolean) => void;
}

export const useBookmarksStore = create<BookmarksStore>()(
  persist(
    (set, get) => ({
      bookmarkedProducts: [],
      isHydrated: false,

      addBookmark: (product: Product) => {
        // Optimistic update
        set(state => {
          const isAlreadyBookmarked = state.bookmarkedProducts.some(p => p.id === product.id);

          if (isAlreadyBookmarked) {
            return state;
          }

          return {
            bookmarkedProducts: [...state.bookmarkedProducts, product],
          };
        });

        // Sync with backend with retry logic
        if (typeof window !== 'undefined') {
          const syncWithRetry = async (retries = 3) => {
            try {
              const response = await fetch('/api/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product }),
              });

              if (response.ok) {
                const data = await response.json();
                // Update store with server response
                if (data.data) {
                  set(state => ({
                    ...state,
                    bookmarkedProducts: data.data.bookmarkedProducts || state.bookmarkedProducts,
                  }));
                }
              } else if (retries > 0) {
                setTimeout(() => syncWithRetry(retries - 1), 1000);
              }
            } catch (error) {
              if (retries > 0) {
                setTimeout(() => syncWithRetry(retries - 1), 1000);
              } else {
                console.warn('Failed to sync bookmarks with backend after retries:', error);
              }
            }
          };

          syncWithRetry();

          // Trigger immediate sync to cookies for backward compatibility
          import('@/lib/unified-storage-sync').then(({ onStoreDataChange, updateCountCookies }) => {
            onStoreDataChange();
            updateCountCookies();
          });
        }
      },

      removeBookmark: (productId: string) => {
        // Optimistic update
        set(state => ({
          bookmarkedProducts: state.bookmarkedProducts.filter(product => product.id !== productId),
        }));

        // Sync with backend
        if (typeof window !== 'undefined') {
          fetch(`/api/bookmarks?productId=${productId}`, {
            method: 'DELETE',
          })
            .then(response => response.json())
            .then(data => {
              // Update store with server response
              if (data.data) {
                set(state => ({
                  ...state,
                  bookmarkedProducts: data.data.bookmarkedProducts || state.bookmarkedProducts,
                }));
              }
            })
            .catch(err => console.warn('Failed to sync bookmarks with backend:', err));

          // Trigger immediate sync to cookies for backward compatibility
          import('@/lib/unified-storage-sync').then(({ onStoreDataChange, updateCountCookies }) => {
            onStoreDataChange();
            updateCountCookies();
          });
        }
      },

      toggleBookmark: (product: Product) => {
        const isBookmarked = get().isBookmarked(product.id);

        // Optimistic update
        if (isBookmarked) {
          set(state => ({
            bookmarkedProducts: state.bookmarkedProducts.filter(p => p.id !== product.id),
          }));
        } else {
          set(state => ({
            bookmarkedProducts: [...state.bookmarkedProducts, product],
          }));
        }

        // Sync with backend
        if (typeof window !== 'undefined') {
          fetch('/api/bookmarks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product }),
          })
            .then(response => response.json())
            .then(data => {
              // Update store with server response
              if (data.data) {
                set(state => ({
                  ...state,
                  bookmarkedProducts: data.data.bookmarkedProducts || state.bookmarkedProducts,
                }));
              }
            })
            .catch(err => console.warn('Failed to sync bookmarks with backend:', err));

          // Trigger immediate sync to cookies for backward compatibility
          import('@/lib/unified-storage-sync').then(({ onStoreDataChange, updateCountCookies }) => {
            onStoreDataChange();
            updateCountCookies();
          });
        }
      },

      clearBookmarks: () => {
        // Optimistic update
        set({ bookmarkedProducts: [] });

        // Sync with backend
        if (typeof window !== 'undefined') {
          fetch('/api/bookmarks?clear=true', {
            method: 'DELETE',
          })
            .then(response => response.json())
            .then(data => {
              // Update store with server response
              if (data.data) {
                set(state => ({
                  ...state,
                  bookmarkedProducts: data.data.bookmarkedProducts || [],
                }));
              }
            })
            .catch(err => console.warn('Failed to sync bookmarks with backend:', err));

          // Trigger immediate sync to cookies for backward compatibility
          import('@/lib/unified-storage-sync').then(({ onStoreDataChange, updateCountCookies }) => {
            onStoreDataChange();
            updateCountCookies();
          });
        }
      },

      initializeFromServer: (serverData: ServerBookmarksData) => {
        set(state => {
          // Prevent multiple initializations if already hydrated
          if (state.isHydrated) {
            return state;
          }

          // Always initialize from server data to ensure consistency
          // Server data takes precedence to prevent hydration mismatches
          return {
            ...state,
            bookmarkedProducts: serverData.bookmarkedProducts || [],
            isHydrated: true,
          };
        });
      },

      // Sync with Redis backend
      syncWithBackend: async () => {
        if (typeof window === 'undefined') return;

        try {
          const response = await fetch('/api/bookmarks');
          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              set(state => ({
                ...state,
                bookmarkedProducts: data.data.bookmarkedProducts || [],
                isHydrated: true,
              }));
            }
          }
        } catch (error) {
          console.warn('Failed to sync bookmarks with backend:', error);
        }
      },

      migrateGuestBookmarks: (authenticatedBookmarks: Product[]): Product[] => {
        const currentBookmarks = get().bookmarkedProducts;
        if (currentBookmarks.length === 0) {
          return authenticatedBookmarks;
        }

        // Merge current bookmarks with authenticated user bookmarks
        const mergedBookmarks = [...authenticatedBookmarks];

        currentBookmarks.forEach(currentBookmark => {
          const exists = mergedBookmarks.some(bookmark => bookmark.id === currentBookmark.id);

          if (!exists) {
            // New bookmark, add to list
            mergedBookmarks.push(currentBookmark);
          }
        });

        // Clear current bookmarks after migration
        get().clearBookmarks();

        return mergedBookmarks;
      },

      clearGuestData: () => {
        bookmarksStorage.clear();
        set({ bookmarkedProducts: [] });
      },

      isBookmarked: (productId: string) => {
        return get().bookmarkedProducts.some(product => product.id === productId);
      },

      getBookmarkCount: () => {
        return get().bookmarkedProducts.length;
      },

      _setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: 'hamsoya-bookmarks-v2', // Use enhanced storage key
      partialize: state => ({ bookmarkedProducts: state.bookmarkedProducts }),
      onRehydrateStorage: () => state => {
        if (state) {
          state._setHydrated(true);
        }
      },
      // Ensure hydration happens immediately
      skipHydration: false,
    }
  )
);

// Initialize bookmarks store on module load for immediate hydration
// This ensures the store is ready before any component renders
if (typeof window !== 'undefined') {
  // Force hydration on client-side immediately
  useBookmarksStore.persist.rehydrate();

  // Set hydration state immediately after rehydration
  const state = useBookmarksStore.getState();
  if (!state.isHydrated) {
    state._setHydrated(true);
  }
}
