import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

interface BookmarksStore {
  bookmarkedProducts: Product[];
  
  // Actions
  addBookmark: (product: Product) => void;
  removeBookmark: (productId: string) => void;
  toggleBookmark: (product: Product) => void;
  clearBookmarks: () => void;
  
  // Computed values
  isBookmarked: (productId: string) => boolean;
  getBookmarkCount: () => number;
}

export const useBookmarksStore = create<BookmarksStore>()(
  persist(
    (set, get) => ({
      bookmarkedProducts: [],

      addBookmark: (product: Product) => {
        set((state) => {
          const isAlreadyBookmarked = state.bookmarkedProducts.some(
            (p) => p.id === product.id
          );

          if (isAlreadyBookmarked) {
            return state;
          }

          return {
            bookmarkedProducts: [...state.bookmarkedProducts, product],
          };
        });
      },

      removeBookmark: (productId: string) => {
        set((state) => ({
          bookmarkedProducts: state.bookmarkedProducts.filter(
            (product) => product.id !== productId
          ),
        }));
      },

      toggleBookmark: (product: Product) => {
        const isBookmarked = get().isBookmarked(product.id);
        
        if (isBookmarked) {
          get().removeBookmark(product.id);
        } else {
          get().addBookmark(product);
        }
      },

      clearBookmarks: () => {
        set({ bookmarkedProducts: [] });
      },

      isBookmarked: (productId: string) => {
        return get().bookmarkedProducts.some((product) => product.id === productId);
      },

      getBookmarkCount: () => {
        return get().bookmarkedProducts.length;
      },
    }),
    {
      name: STORAGE_KEYS.bookmarks,
    }
  )
);
