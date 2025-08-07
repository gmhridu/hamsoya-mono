import type { ServerCartData } from '@/lib/server-storage-cache';
import { cartStorage } from '@/lib/storage-sync';
import { CartItem, Product } from '@/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  isHydrated: boolean;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Server-side hydration
  initializeFromServer: (serverData: ServerCartData) => void;
  syncWithBackend: () => Promise<void>;

  // Migration methods
  migrateGuestCart: (authenticatedItems: CartItem[]) => CartItem[];
  clearGuestData: () => void;

  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;

  // Internal hydration
  _setHydrated: (hydrated: boolean) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isHydrated: false,

      addItem: (product: Product, quantity = 1) => {
        // Optimistic update
        set(state => {
          const existingItem = state.items.find(item => item.product.id === product.id);

          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity }],
          };
        });

        // Sync with backend with retry logic
        if (typeof window !== 'undefined') {
          const syncWithRetry = async (retries = 3) => {
            try {
              const response = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product, quantity }),
              });

              if (response.ok) {
                const data = await response.json();
                // Update store with server response
                if (data.data) {
                  set(state => ({
                    ...state,
                    items: data.data.items || state.items,
                  }));
                }
              } else if (retries > 0) {
                // Retry on failure
                setTimeout(() => syncWithRetry(retries - 1), 1000);
              }
            } catch (error) {
              if (retries > 0) {
                // Retry on network error
                setTimeout(() => syncWithRetry(retries - 1), 1000);
              } else {
                console.warn('Failed to sync cart with backend after retries:', error);
              }
            }
          };

          syncWithRetry();

          // Trigger immediate sync to cookies for backward compatibility
          import('@/lib/unified-storage-sync')
            .then(({ onStoreDataChange, updateCountCookies }) => {
              onStoreDataChange();
              updateCountCookies();
            })
            .catch(err => console.warn('Failed to trigger cart sync:', err));
        }
      },

      removeItem: (productId: string) => {
        // Optimistic update
        set(state => ({
          items: state.items.filter(item => item.product.id !== productId),
        }));

        // Sync with backend with retry logic
        if (typeof window !== 'undefined') {
          const syncWithRetry = async (retries = 3) => {
            try {
              const response = await fetch(`/api/cart?productId=${productId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                const data = await response.json();
                // Update store with server response
                if (data.data) {
                  set(state => ({
                    ...state,
                    items: data.data.items || state.items,
                  }));
                }
              } else if (retries > 0) {
                setTimeout(() => syncWithRetry(retries - 1), 1000);
              }
            } catch (error) {
              if (retries > 0) {
                setTimeout(() => syncWithRetry(retries - 1), 1000);
              } else {
                console.warn('Failed to sync cart removal with backend after retries:', error);
              }
            }
          };

          syncWithRetry();

          // Trigger immediate sync to cookies for backward compatibility
          import('@/lib/unified-storage-sync')
            .then(({ onStoreDataChange, updateCountCookies }) => {
              onStoreDataChange();
              updateCountCookies();
            })
            .catch(err => console.warn('Failed to trigger cart sync:', err));
        }
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        // Optimistic update
        set(state => ({
          items: state.items.map(item =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));

        // Sync with backend
        if (typeof window !== 'undefined') {
          fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity }),
          })
            .then(response => response.json())
            .then(data => {
              // Update store with server response
              if (data.data) {
                set(state => ({
                  ...state,
                  items: data.data.items || state.items,
                }));
              }
            })
            .catch(err => console.warn('Failed to sync cart with backend:', err));

          // Trigger immediate sync to cookies for backward compatibility
          import('@/lib/unified-storage-sync')
            .then(({ onStoreDataChange, updateCountCookies }) => {
              onStoreDataChange();
              updateCountCookies();
            })
            .catch(err => console.warn('Failed to trigger cart sync:', err));
        }
      },

      clearCart: () => {
        // Optimistic update
        set({ items: [] });

        // Sync with backend
        if (typeof window !== 'undefined') {
          fetch('/api/cart?clear=true', {
            method: 'DELETE',
          })
            .then(response => response.json())
            .then(data => {
              // Update store with server response
              if (data.data) {
                set(state => ({
                  ...state,
                  items: data.data.items || [],
                }));
              }
            })
            .catch(err => console.warn('Failed to sync cart with backend:', err));

          // Trigger immediate sync to cookies for backward compatibility
          import('@/lib/unified-storage-sync')
            .then(({ onStoreDataChange, updateCountCookies }) => {
              onStoreDataChange();
              updateCountCookies();
            })
            .catch(err => console.warn('Failed to trigger cart sync:', err));
        }
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      toggleCart: () => {
        set(state => ({ isOpen: !state.isOpen }));
      },

      initializeFromServer: (serverData: ServerCartData) => {
        set(state => {
          // Prevent multiple initializations if already hydrated
          if (state.isHydrated) {
            return state;
          }

          // Always initialize from server data to ensure consistency
          // Server data takes precedence to prevent hydration mismatches
          return {
            ...state,
            items: serverData.items || [],
            isHydrated: true,
          };
        });
      },

      // Sync with Redis backend
      syncWithBackend: async () => {
        if (typeof window === 'undefined') return;

        try {
          const response = await fetch('/api/cart');
          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              set(state => ({
                ...state,
                items: data.data.items || [],
                isHydrated: true,
              }));
            }
          }
        } catch (error) {
          console.warn('Failed to sync cart with backend:', error);
        }
      },

      migrateGuestCart: (authenticatedItems: CartItem[]): CartItem[] => {
        const currentItems = get().items;
        if (currentItems.length === 0) {
          return authenticatedItems;
        }

        // Merge current cart with authenticated user cart
        const mergedItems = [...authenticatedItems];

        currentItems.forEach(currentItem => {
          const existingIndex = mergedItems.findIndex(
            item => item.product.id === currentItem.product.id
          );

          if (existingIndex >= 0) {
            // Item exists, add quantities
            mergedItems[existingIndex].quantity += currentItem.quantity;
          } else {
            // New item, add to cart
            mergedItems.push(currentItem);
          }
        });

        // Clear current cart after migration
        get().clearCart();

        return mergedItems;
      },

      clearGuestData: () => {
        cartStorage.clear();
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },

      getItemQuantity: (productId: string) => {
        const item = get().items.find(item => item.product.id === productId);
        return item?.quantity || 0;
      },

      isInCart: (productId: string) => {
        return get().items.some(item => item.product.id === productId);
      },

      _setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: 'hamsoya-cart-v2', // Use enhanced storage key
      partialize: state => ({ items: state.items }),
      onRehydrateStorage: () => state => {
        if (state) {
          state.isOpen = false;
          state._setHydrated(true);
        }
      },
      // Ensure hydration happens immediately
      skipHydration: false,
    }
  )
);

// Initialize cart store on module load for immediate hydration
// This ensures the store is ready before any component renders
if (typeof window !== 'undefined') {
  // Force hydration on client-side immediately
  useCartStore.persist.rehydrate();

  // Set hydration state immediately after rehydration
  const state = useCartStore.getState();
  if (!state.isHydrated) {
    state._setHydrated(true);
  }
}
