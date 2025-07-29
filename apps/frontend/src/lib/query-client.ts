import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes for most data
      // Cache time: how long data stays in cache after component unmounts
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors (reduced from 3)
        return failureCount < 2;
      },
      // Retry delay with exponential backoff
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
      // Refetch on reconnect for critical data
      refetchOnReconnect: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: 'always',
      // Network mode configuration
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      // Network mode for mutations
      networkMode: 'online',
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Authentication
  auth: {
    all: ['auth'] as const,
    cooldownStatus: (email: string) => ['cooldown-status', email] as const,
    user: () => ['auth', 'user'] as const,
    me: ['auth', 'me'] as const,
    profile: ['auth', 'profile'] as const,
  },
  // Products
  products: {
    all: ['products'] as const,
    lists: () => ['products', 'list'] as const,
    list: (filters?: Record<string, any>) => ['products', 'list', filters] as const,
    details: () => ['products', 'detail'] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    featured: ['products', 'featured'] as const,
    byCategory: (category: string) => ['products', 'category', category] as const,
    search: (query: string) => ['products', 'search', query] as const,
  },
  // Categories
  categories: {
    all: ['categories'] as const,
    lists: () => ['categories', 'list'] as const,
    list: ['categories', 'list'] as const,
  },
  // Reviews
  reviews: {
    all: ['reviews'] as const,
    byProduct: (productId: string) => ['reviews', 'product', productId] as const,
  },
  // Cart (if we need server-side cart)
  cart: {
    items: ['cart', 'items'] as const,
  },
  // Orders
  orders: {
    all: ['orders'] as const,
    list: ['orders', 'list'] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
} as const;

// Helper function to invalidate cooldown queries
export const invalidateCooldownQueries = (email: string) => {
  queryClient.invalidateQueries({
    queryKey: queryKeys.auth.cooldownStatus(email),
    exact: true,
  });
};
