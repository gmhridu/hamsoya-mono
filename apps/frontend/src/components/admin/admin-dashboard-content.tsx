'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCard } from '@/components/admin/ui/stats-card';
import { DataTable } from '@/components/admin/ui/data-table';
import { SalesChart } from '@/components/admin/ui/sales-chart';
import { ActivityFeed } from '@/components/admin/ui/activity-feed';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Eye,
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
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome to your admin dashboard. Here&apos;s what&apos;s happening with your store.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Sales"
          value={`৳${mockStats.totalSales.toLocaleString()}`}
          description="from last month"
          icon={DollarSign}
          trend={{ value: 12.5, label: 'from last month', isPositive: true }}
        />
        <StatsCard
          title="Total Orders"
          value={mockStats.totalOrders.toLocaleString()}
          description="from last month"
          icon={ShoppingCart}
          trend={{ value: 8.2, label: 'from last month', isPositive: true }}
        />
        <StatsCard
          title="Total Customers"
          value={mockStats.totalCustomers.toLocaleString()}
          description="from last month"
          icon={Users}
          trend={{ value: 15.3, label: 'from last month', isPositive: true }}
        />
        <StatsCard
          title="Total Products"
          value={mockStats.totalProducts.toLocaleString()}
          description="active products"
          icon={Package}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <SalesChart title="Sales Overview" height={300} />

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={mockTopProducts}
              columns={productColumns}
              searchable={false}
              pageSize={5}
            />
          </CardContent>
        </Card>
      </div>

      {/* Activity and Recent Orders */}
      <div className="grid gap-6 md:grid-cols-2">
        <ActivityFeed title="Recent Activity" maxItems={6} />

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={mockRecentOrders}
              columns={orderColumns}
              searchPlaceholder="Search orders..."
              pageSize={5}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
