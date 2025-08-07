'use client';

import { queryClient } from '@/lib/query-client';
import { authCacheManager } from '@/lib/auth-cache-manager';
import { useAuthStore } from '@/store/auth-store';
import { AUTH_QUERY_KEYS } from '@/types/auth';

/**
 * Admin-specific query keys for data prefetching
 */
export const ADMIN_QUERY_KEYS = {
  dashboard: {
    stats: ['admin', 'dashboard', 'stats'] as const,
    overview: ['admin', 'dashboard', 'overview'] as const,
  },
  orders: {
    recent: ['admin', 'orders', 'recent'] as const,
    count: ['admin', 'orders', 'count'] as const,
    pending: ['admin', 'orders', 'pending'] as const,
  },
  products: {
    top: ['admin', 'products', 'top'] as const,
    lowStock: ['admin', 'products', 'low-stock'] as const,
    count: ['admin', 'products', 'count'] as const,
  },
  customers: {
    recent: ['admin', 'customers', 'recent'] as const,
    count: ['admin', 'customers', 'count'] as const,
  },
  permissions: ['admin', 'permissions'] as const,
  analytics: {
    sales: ['admin', 'analytics', 'sales'] as const,
    traffic: ['admin', 'analytics', 'traffic'] as const,
  },
} as const;

/**
 * Mock data generators for admin dashboard
 * These will be replaced with real API calls
 */
const mockDataGenerators = {
  dashboardStats: () => Promise.resolve({
    totalSales: 45231,
    totalOrders: 1234,
    totalCustomers: 567,
    totalProducts: 89,
    salesGrowth: 12.5,
    ordersGrowth: 8.2,
    customersGrowth: 15.3,
  }),

  recentOrders: () => Promise.resolve([
    {
      id: 'ORD-001',
      customer: 'John Doe',
      email: 'john@example.com',
      total: 2500,
      status: 'pending',
      date: '2024-01-15',
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      total: 1800,
      status: 'confirmed',
      date: '2024-01-15',
    },
  ]),

  topProducts: () => Promise.resolve([
    {
      id: 'PRD-001',
      name: 'Premium Honey',
      sales: 156,
      revenue: 15600,
      stock: 45,
    },
    {
      id: 'PRD-002',
      name: 'Organic Dates',
      sales: 134,
      revenue: 13400,
      stock: 23,
    },
  ]),

  adminPermissions: () => Promise.resolve([
    'admin:read',
    'admin:write',
    'admin:delete',
    'orders:manage',
    'products:manage',
    'customers:view',
  ]),
};

/**
 * Admin data prefetching service
 * Handles preloading of admin dashboard data for smooth navigation
 */
export class AdminDataPrefetcher {
  private static instance: AdminDataPrefetcher;
  private prefetchPromises: Map<string, Promise<any>> = new Map();

  static getInstance(): AdminDataPrefetcher {
    if (!AdminDataPrefetcher.instance) {
      AdminDataPrefetcher.instance = new AdminDataPrefetcher();
    }
    return AdminDataPrefetcher.instance;
  }

  /**
   * Check if user has admin access
   */
  private hasAdminAccess(): boolean {
    const { isAuthenticated, user } = useAuthStore.getState();
    return isAuthenticated && user?.role === 'ADMIN';
  }

  /**
   * Prefetch dashboard statistics
   */
  async prefetchDashboardStats(): Promise<void> {
    if (!this.hasAdminAccess()) return;

    const key = 'dashboard-stats';
    if (this.prefetchPromises.has(key)) {
      return this.prefetchPromises.get(key);
    }

    const promise = queryClient.prefetchQuery({
      queryKey: ADMIN_QUERY_KEYS.dashboard.stats,
      queryFn: mockDataGenerators.dashboardStats,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    });

    this.prefetchPromises.set(key, promise);
    return promise;
  }

  /**
   * Prefetch recent orders
   */
  async prefetchRecentOrders(): Promise<void> {
    if (!this.hasAdminAccess()) return;

    const key = 'recent-orders';
    if (this.prefetchPromises.has(key)) {
      return this.prefetchPromises.get(key);
    }

    const promise = queryClient.prefetchQuery({
      queryKey: ADMIN_QUERY_KEYS.orders.recent,
      queryFn: mockDataGenerators.recentOrders,
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
    });

    this.prefetchPromises.set(key, promise);
    return promise;
  }

  /**
   * Prefetch top products
   */
  async prefetchTopProducts(): Promise<void> {
    if (!this.hasAdminAccess()) return;

    const key = 'top-products';
    if (this.prefetchPromises.has(key)) {
      return this.prefetchPromises.get(key);
    }

    const promise = queryClient.prefetchQuery({
      queryKey: ADMIN_QUERY_KEYS.products.top,
      queryFn: mockDataGenerators.topProducts,
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 20 * 60 * 1000, // 20 minutes
    });

    this.prefetchPromises.set(key, promise);
    return promise;
  }

  /**
   * Prefetch admin permissions
   */
  async prefetchAdminPermissions(): Promise<void> {
    if (!this.hasAdminAccess()) return;

    const key = 'admin-permissions';
    if (this.prefetchPromises.has(key)) {
      return this.prefetchPromises.get(key);
    }

    const promise = queryClient.prefetchQuery({
      queryKey: ADMIN_QUERY_KEYS.permissions,
      queryFn: mockDataGenerators.adminPermissions,
      staleTime: 15 * 60 * 1000, // 15 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    });

    this.prefetchPromises.set(key, promise);
    return promise;
  }

  /**
   * Prefetch all critical admin dashboard data
   */
  async prefetchAllAdminData(): Promise<void> {
    if (!this.hasAdminAccess()) {
      console.log('User does not have admin access, skipping admin data prefetch');
      return;
    }

    console.log('Starting admin data prefetch...');

    try {
      // Prefetch all critical data in parallel
      await Promise.allSettled([
        this.prefetchDashboardStats(),
        this.prefetchRecentOrders(),
        this.prefetchTopProducts(),
        this.prefetchAdminPermissions(),
      ]);

      console.log('Admin data prefetch completed successfully');
    } catch (error) {
      console.error('Admin data prefetch failed:', error);
      // Don't throw - navigation should still work
    }
  }

  /**
   * Sync auth state before admin operations
   */
  async syncAuthState(): Promise<void> {
    try {
      // Invalidate and refetch current user data to ensure fresh state
      await queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEYS.me,
      });

      // Wait for fresh user data
      await queryClient.refetchQueries({
        queryKey: AUTH_QUERY_KEYS.me,
      });

      console.log('Auth state synchronized for admin operations');
    } catch (error) {
      console.error('Auth state sync failed:', error);
      // Don't throw - navigation should still work
    }
  }

  /**
   * Clear admin data cache
   */
  clearAdminCache(): void {
    // Clear all admin-related queries
    queryClient.removeQueries({
      predicate: (query) => {
        const queryKey = query.queryKey;
        return Array.isArray(queryKey) && queryKey[0] === 'admin';
      },
    });

    // Clear prefetch promises
    this.prefetchPromises.clear();

    console.log('Admin cache cleared');
  }

  /**
   * Check if admin data is already cached
   */
  isAdminDataCached(): boolean {
    const statsQuery = queryClient.getQueryState(ADMIN_QUERY_KEYS.dashboard.stats);
    const ordersQuery = queryClient.getQueryState(ADMIN_QUERY_KEYS.orders.recent);
    
    return !!(statsQuery?.data && ordersQuery?.data);
  }
}

// Export singleton instance
export const adminDataPrefetcher = AdminDataPrefetcher.getInstance();

// Export convenience functions
export const prefetchAdminData = () => adminDataPrefetcher.prefetchAllAdminData();
export const clearAdminCache = () => adminDataPrefetcher.clearAdminCache();
export const isAdminDataCached = () => adminDataPrefetcher.isAdminDataCached();
