/**
 * Enhanced Server Storage Provider
 * Provides centralized cart and bookmark data from server-side rendering
 * Follows the same pattern as ServerAuthProvider for consistency
 * Supports client-side updates for seamless user experience
 */

'use client';

import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import type { CartItem, Product } from '@/types';

// Server-side storage data interfaces
export interface ServerCartData {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface ServerBookmarksData {
  bookmarkedProducts: Product[];
  bookmarkCount: number;
}

export interface ServerStorageData {
  cart: ServerCartData;
  bookmarks: ServerBookmarksData;
  isHydrated: true;
}

interface ServerStorageContextType {
  cart: ServerCartData;
  bookmarks: ServerBookmarksData;
  isHydrated: boolean;
  // Client-side update methods
  updateCart: (cart: ServerCartData) => void;
  updateBookmarks: (bookmarks: ServerBookmarksData) => void;
  clearStorage: () => void;
}

interface EnhancedServerStorageProviderProps {
  children: ReactNode;
  cart: ServerCartData;
  bookmarks: ServerBookmarksData;
}

const ServerStorageContext = createContext<ServerStorageContextType | undefined>(undefined);

/**
 * Hook to access server storage context
 */
export function useServerStorage() {
  const context = useContext(ServerStorageContext);
  if (context === undefined) {
    throw new Error('useServerStorage must be used within an EnhancedServerStorageProvider');
  }
  return context;
}

/**
 * Enhanced Server Storage Provider Component
 * Provides cart and bookmark data fetched server-side to all child components
 * Supports client-side updates for seamless cart/bookmark operations
 */
export function EnhancedServerStorageProvider({ children, cart, bookmarks }: EnhancedServerStorageProviderProps) {
  // Use state to allow client-side updates while preserving server-side initial data
  const [currentCart, setCurrentCart] = useState<ServerCartData>(cart);
  const [currentBookmarks, setCurrentBookmarks] = useState<ServerBookmarksData>(bookmarks);

  // Update state when server props change (for navigation between pages)
  useEffect(() => {
    setCurrentCart(cart);
    setCurrentBookmarks(bookmarks);
  }, [cart, bookmarks]);

  // Listen for storage events from client-side operations
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      const cartData = event.detail;
      if (cartData) {
        setCurrentCart(cartData);
      }
    };

    const handleBookmarksUpdate = (event: CustomEvent) => {
      const bookmarksData = event.detail;
      if (bookmarksData) {
        setCurrentBookmarks(bookmarksData);
      }
    };

    const handleStorageClear = () => {
      setCurrentCart({
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
      setCurrentBookmarks({
        bookmarkedProducts: [],
        bookmarkCount: 0,
      });
    };

    window.addEventListener('storage:cart-update', handleCartUpdate as EventListener);
    window.addEventListener('storage:bookmarks-update', handleBookmarksUpdate as EventListener);
    window.addEventListener('storage:clear', handleStorageClear);

    return () => {
      window.removeEventListener('storage:cart-update', handleCartUpdate as EventListener);
      window.removeEventListener('storage:bookmarks-update', handleBookmarksUpdate as EventListener);
      window.removeEventListener('storage:clear', handleStorageClear);
    };
  }, []);

  // Client-side update methods
  const updateCart = (newCart: ServerCartData) => {
    setCurrentCart(newCart);
  };

  const updateBookmarks = (newBookmarks: ServerBookmarksData) => {
    setCurrentBookmarks(newBookmarks);
  };

  const clearStorage = () => {
    setCurrentCart({
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
    setCurrentBookmarks({
      bookmarkedProducts: [],
      bookmarkCount: 0,
    });
  };

  const value: ServerStorageContextType = {
    cart: currentCart,
    bookmarks: currentBookmarks,
    isHydrated: true, // Always true since data comes from server
    updateCart,
    updateBookmarks,
    clearStorage,
  };

  return <ServerStorageContext.Provider value={value}>{children}</ServerStorageContext.Provider>;
}

/**
 * Server-side cart utilities
 */
export class ServerCart {
  private data: ServerCartData;

  constructor(data: ServerCartData) {
    this.data = data;
  }

  get items() {
    return this.data.items;
  }
  get totalItems() {
    return this.data.totalItems;
  }
  get totalPrice() {
    return this.data.totalPrice;
  }
  get isEmpty() {
    return this.data.items.length === 0;
  }

  isInCart(productId: string): boolean {
    return this.data.items.some(item => item.product.id === productId);
  }

  getItemQuantity(productId: string): number {
    const item = this.data.items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  }
}

/**
 * Server-side bookmarks utilities
 */
export class ServerBookmarks {
  private data: ServerBookmarksData;

  constructor(data: ServerBookmarksData) {
    this.data = data;
  }

  get bookmarkedProducts() {
    return this.data.bookmarkedProducts;
  }
  get bookmarkCount() {
    return this.data.bookmarkCount;
  }
  get isEmpty() {
    return this.data.bookmarkedProducts.length === 0;
  }

  isBookmarked(productId: string): boolean {
    return this.data.bookmarkedProducts.some(product => product.id === productId);
  }
}

/**
 * Create server-side storage instances
 */
export function createServerStorageInstances(data: ServerStorageData) {
  return {
    cart: new ServerCart(data.cart),
    bookmarks: new ServerBookmarks(data.bookmarks),
  };
}
