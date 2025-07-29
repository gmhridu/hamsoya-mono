import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-client';
import type { ProductFilters } from '@/types';
import { useQuery } from '@tanstack/react-query';

// Hook for getting all products with filters
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () =>
      apiClient.getProducts({
        category: filters.category,
        search: filters.search,
        featured: filters.featured,
        inStock: filters.inStock,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        limit: 50,
        offset: 0,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting a single product by ID
export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => apiClient.getProduct(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!id,
  });
}

// Hook for getting featured products
export function useFeaturedProducts(limit: number = 8) {
  return useQuery({
    queryKey: queryKeys.products.featured,
    queryFn: () => apiClient.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for getting products by category
export function useProductsByCategory(categorySlug: string, limit?: number) {
  return useQuery({
    queryKey: queryKeys.products.byCategory(categorySlug),
    queryFn: () => apiClient.getProductsByCategory(categorySlug, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!categorySlug,
  });
}

// Hook for searching products
export function useProductSearch(query: string, limit?: number) {
  return useQuery({
    queryKey: queryKeys.products.search(query),
    queryFn: () => apiClient.searchProducts(query, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!query && query.length > 0,
  });
}

// Hook for getting product reviews (placeholder - will be implemented when reviews API is ready)
export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.byProduct(productId),
    queryFn: () => Promise.resolve([]), // Placeholder - return empty array for now
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!productId,
  });
}

// Hook for getting all categories
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list,
    queryFn: () => apiClient.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Hook for getting a category by slug
export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['categories', 'detail', slug],
    queryFn: () => apiClient.getCategory(slug),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: !!slug,
  });
}
