'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/admin/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OrderDetailsModal } from './order-details-modal';
import {
  Eye,
  MoreHorizontal,
  Download,
  Filter,
  Calendar,
  Search,
} from 'lucide-react';

// Mock orders data
const mockOrders = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    email: 'john@example.com',
    phone: '+880 1234567890',
    total: 2500,
    status: 'pending',
    paymentStatus: 'pending',
    date: '2024-01-15T10:30:00Z',
    items: 3,
    shippingAddress: 'Dhaka, Bangladesh',
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+880 1234567891',
    total: 1800,
    status: 'confirmed',
    paymentStatus: 'paid',
    date: '2024-01-15T09:15:00Z',
    items: 2,
    shippingAddress: 'Chittagong, Bangladesh',
  },
  {
    id: 'ORD-003',
    customer: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+880 1234567892',
    total: 3200,
    status: 'delivered',
    paymentStatus: 'paid',
    date: '2024-01-14T14:20:00Z',
    items: 5,
    shippingAddress: 'Sylhet, Bangladesh',
  },
  {
    id: 'ORD-004',
    customer: 'Alice Brown',
    email: 'alice@example.com',
    phone: '+880 1234567893',
    total: 1200,
    status: 'cancelled',
    paymentStatus: 'refunded',
    date: '2024-01-14T11:45:00Z',
    items: 1,
    shippingAddress: 'Rajshahi, Bangladesh',
  },
  {
    id: 'ORD-005',
    customer: 'Charlie Wilson',
    email: 'charlie@example.com',
    phone: '+880 1234567894',
    total: 4500,
    status: 'processing',
    paymentStatus: 'paid',
    date: '2024-01-13T16:30:00Z',
    items: 7,
    shippingAddress: 'Khulna, Bangladesh',
  },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'default';
    case 'confirmed':
    case 'processing':
      return 'secondary';
    case 'pending':
      return 'outline';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getPaymentStatusVariant = (status: string) => {
  switch (status) {
    case 'paid':
      return 'default';
    case 'pending':
      return 'outline';
    case 'refunded':
      return 'destructive';
    default:
      return 'outline';
  }
};

export function OrdersManagement() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');

  // Filter orders based on status and search
  const filteredOrders = mockOrders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    // TODO: Implement status update API call
    console.log(`Updating order ${orderId} to status: ${newStatus}`);
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
  };

  const orderColumns = [
    {
      key: 'id',
      title: 'Order ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'customer',
      title: 'Customer',
      sortable: true,
      render: (value: string, order: any) => (
        <div className="min-w-[150px]">
          <div className="font-medium truncate">{value}</div>
          <div className="text-xs sm:text-sm text-muted-foreground truncate">{order.email}</div>
        </div>
      ),
    },
    {
      key: 'total',
      title: 'Total',
      sortable: true,
      render: (value: number) => (
        <span className="font-medium">৳{value.toLocaleString()}</span>
      ),
    },
    {
      key: 'items',
      title: 'Items',
      sortable: true,
      render: (value: number) => (
        <span className="text-sm">{value} item{value !== 1 ? 's' : ''}</span>
      ),
    },
    {
      key: 'status',
      title: 'Order Status',
      render: (value: string) => (
        <Badge variant={getStatusVariant(value)} className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: 'paymentStatus',
      title: 'Payment',
      render: (value: string) => (
        <Badge variant={getPaymentStatusVariant(value)} className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: 'date',
      title: 'Date',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm">
          {new Date(value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, order: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewOrder(order)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'confirmed')}>
              Confirm Order
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'processing')}>
              Mark Processing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'delivered')}>
              Mark Delivered
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusUpdate(order.id, 'cancelled')}
              className="text-destructive"
            >
              Cancel Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <CardTitle className="text-lg sm:text-xl">Orders</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none min-h-[44px]">
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Filters - Responsive layout */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders, customers, or emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-10">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          <DataTable
            data={filteredOrders}
            columns={orderColumns}
            searchable={false}
            emptyMessage="No orders found"
            keyField="id"
          />
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </>
  );
}
