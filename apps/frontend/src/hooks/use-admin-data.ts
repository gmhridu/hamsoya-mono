'use client';

import { useQuery } from '@tanstack/react-query';
import { ADMIN_QUERY_KEYS } from '@/lib/admin-data-prefetcher';
import { useAuthStore } from '@/store/auth-store';

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
    {
      id: 'ORD-003',
      customer: 'Bob Johnson',
      email: 'bob@example.com',
      total: 3200,
      status: 'delivered',
      date: '2024-01-14',
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
    {
      id: 'PRD-003',
      name: 'Mixed Nuts',
      sales: 98,
      revenue: 9800,
      stock: 67,
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
 * Hook for admin dashboard statistics
 */
export function useAdminDashboardStats() {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.dashboard.stats,
    queryFn: mockDataGenerators.dashboardStats,
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * Hook for recent orders data
 */
export function useAdminRecentOrders() {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.orders.recent,
    queryFn: mockDataGenerators.recentOrders,
    enabled: isAdmin,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * Hook for top products data
 */
export function useAdminTopProducts() {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.products.top,
    queryFn: mockDataGenerators.topProducts,
    enabled: isAdmin,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * Hook for admin permissions
 */
export function useAdminPermissions() {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.permissions,
    queryFn: mockDataGenerators.adminPermissions,
    enabled: isAdmin,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * Comprehensive admin data hook
 * Provides all admin dashboard data in a single hook
 */
export function useAdminData() {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  const dashboardStats = useAdminDashboardStats();
  const recentOrders = useAdminRecentOrders();
  const topProducts = useAdminTopProducts();
  const permissions = useAdminPermissions();

  const isLoading = dashboardStats.isLoading || recentOrders.isLoading || topProducts.isLoading || permissions.isLoading;
  const isError = dashboardStats.isError || recentOrders.isError || topProducts.isError || permissions.isError;
  const error = dashboardStats.error || recentOrders.error || topProducts.error || permissions.error;

  // Check if any critical data is available (for optimistic rendering)
  const hasData = dashboardStats.data || recentOrders.data || topProducts.data;

  return {
    // Individual data
    dashboardStats: dashboardStats.data,
    recentOrders: recentOrders.data,
    topProducts: topProducts.data,
    permissions: permissions.data,

    // Loading states
    isLoading,
    isError,
    error,
    hasData,

    // Individual loading states for granular control
    isDashboardStatsLoading: dashboardStats.isLoading,
    isRecentOrdersLoading: recentOrders.isLoading,
    isTopProductsLoading: topProducts.isLoading,
    isPermissionsLoading: permissions.isLoading,

    // Individual error states
    dashboardStatsError: dashboardStats.error,
    recentOrdersError: recentOrders.error,
    topProductsError: topProducts.error,
    permissionsError: permissions.error,

    // Refetch functions
    refetchDashboardStats: dashboardStats.refetch,
    refetchRecentOrders: recentOrders.refetch,
    refetchTopProducts: topProducts.refetch,
    refetchPermissions: permissions.refetch,

    // Refetch all data
    refetchAll: () => {
      dashboardStats.refetch();
      recentOrders.refetch();
      topProducts.refetch();
      permissions.refetch();
    },

    // Admin access check
    isAdmin,
  };
}

/**
 * Hook for checking if admin data is cached
 */
export function useAdminDataCache() {
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  const dashboardStats = useAdminDashboardStats();
  const recentOrders = useAdminRecentOrders();
  const topProducts = useAdminTopProducts();

  const isCached = !!(dashboardStats.data && recentOrders.data && topProducts.data);
  const isStale = dashboardStats.isStale || recentOrders.isStale || topProducts.isStale;

  return {
    isCached,
    isStale,
    isAdmin,
    cacheStatus: {
      dashboardStats: !!dashboardStats.data,
      recentOrders: !!recentOrders.data,
      topProducts: !!topProducts.data,
    },
  };
}

/**
 * Type definitions for admin data
 */
export interface AdminDashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  salesGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
}

export interface AdminOrder {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: string;
  date: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  stock: number;
}

export type AdminPermission = string;
