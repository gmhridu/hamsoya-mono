'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/admin/ui/stats-card';
import { DataTable } from '@/components/admin/ui/data-table';
import { SalesChart } from '@/components/admin/ui/sales-chart';
import { ActivityFeed } from '@/components/admin/ui/activity-feed';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminData } from '@/hooks/use-admin-data';
import { useEffect, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Eye,
  RefreshCw,
} from 'lucide-react';

// Mock data - replace with real data from API
const mockStats = {
  totalSales: 45231,
  totalOrders: 1234,
  totalCustomers: 567,
  totalProducts: 89,
};

const mockRecentOrders = [
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
];

const mockTopProducts = [
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
];

const orderColumns = [
  {
    key: 'id',
    title: 'Order ID',
    sortable: true,
  },
  {
    key: 'customer',
    title: 'Customer',
    sortable: true,
  },
  {
    key: 'email',
    title: 'Email',
    sortable: true,
  },
  {
    key: 'total',
    title: 'Total',
    render: (value: number) => `৳${value.toLocaleString()}`,
    sortable: true,
  },
  {
    key: 'status',
    title: 'Status',
    render: (value: string) => (
      <Badge
        variant={
          value === 'delivered'
            ? 'default'
            : value === 'confirmed'
            ? 'secondary'
            : 'outline'
        }
      >
        {value}
      </Badge>
    ),
  },
  {
    key: 'date',
    title: 'Date',
    sortable: true,
  },
  {
    key: 'actions',
    title: 'Actions',
    render: () => (
      <Button variant="ghost" size="sm">
        <Eye className="h-4 w-4" />
      </Button>
    ),
  },
];

const productColumns = [
  {
    key: 'name',
    title: 'Product',
    sortable: true,
  },
  {
    key: 'sales',
    title: 'Sales',
    sortable: true,
  },
  {
    key: 'revenue',
    title: 'Revenue',
    render: (value: number) => `৳${value.toLocaleString()}`,
    sortable: true,
  },
  {
    key: 'stock',
    title: 'Stock',
    render: (value: number) => (
      <Badge variant={value < 30 ? 'destructive' : 'default'}>
        {value}
      </Badge>
    ),
    sortable: true,
  },
];

export function AdminDashboardContent() {
  console.log('AdminDashboardContent - Component rendering');

  // Prevent hydration mismatch by ensuring client-side only rendering
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use admin data hooks for real-time data
  const {
    dashboardStats,
    recentOrders,
    topProducts,
    isLoading,
    isError,
    error,
    hasData,
    refetchAll,
    isAdmin,
  } = useAdminData();

  // Show loading state if no data is available yet
  if (isLoading && !hasData) {
    return (
      <div className="space-y-4 md:space-y-6">
        {/* Page Header */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-muted rounded animate-pulse"></div>
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-card rounded-lg animate-pulse"></div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
          <div className="h-80 bg-card rounded-lg animate-pulse"></div>
          <div className="h-80 bg-card rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error and no cached data
  if (isError && !hasData) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-center min-h-[400px] bg-background">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-destructive">Dashboard Error</h2>
            <p className="text-muted-foreground">There was an error loading the admin dashboard.</p>
            <Button onClick={refetchAll} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Use real data if available, fallback to mock data
  const stats = dashboardStats || mockStats;
  const orders = recentOrders || mockRecentOrders;
  const products = topProducts || mockTopProducts;

  // Safely access growth properties
  const salesGrowth = (dashboardStats as any)?.salesGrowth || 12.5;
  const ordersGrowth = (dashboardStats as any)?.ordersGrowth || 8.2;
  const customersGrowth = (dashboardStats as any)?.customersGrowth || 15.3;

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Skeleton loading for stats cards */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Skeleton loading for charts */}
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-80 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-4 md:space-y-6">
      {/* Page Header with refresh button */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome to your admin dashboard. Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={refetchAll}
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="hidden sm:flex"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {/* KPI Cards - Responsive grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Sales"
          value={`৳${stats.totalSales.toLocaleString()}`}
          description="from last month"
          icon={DollarSign}
          trend={{ value: salesGrowth, label: 'from last month', isPositive: true }}
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          description="from last month"
          icon={ShoppingCart}
          trend={{ value: ordersGrowth, label: 'from last month', isPositive: true }}
        />
        <StatsCard
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          description="from last month"
          icon={Users}
          trend={{ value: customersGrowth, label: 'from last month', isPositive: true }}
        />
        <StatsCard
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          description="active products"
          icon={Package}
        />
      </div>

      {/* Charts Section - Responsive layout */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        <SalesChart title="Sales Overview" height={300} />

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={products}
              columns={productColumns}
              searchable={false}
              pageSize={5}
              keyField="id"
            />
          </CardContent>
        </Card>
      </div>

      {/* Activity and Recent Orders - Responsive layout */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        <ActivityFeed title="Recent Activity" maxItems={6} />

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={orders}
              columns={orderColumns}
              searchPlaceholder="Search orders..."
              pageSize={5}
              keyField="id"
            />
          </CardContent>
        </Card>
      </div>
    </div>
    );
  } catch (error) {
    console.error('AdminDashboardContent - Rendering error:', error);
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-destructive">Dashboard Error</h2>
          <p className="text-muted-foreground">There was an error loading the admin dashboard.</p>
          <p className="text-sm text-muted-foreground">Check the console for more details.</p>
        </div>
      </div>
    );
  }
}
