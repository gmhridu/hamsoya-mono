'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/admin/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
// import { CustomerDetailsModal } from './customer-details-modal';
import {
  Eye,
  MoreHorizontal,
  Download,
  Filter,
  Search,
  UserCheck,
  UserX,
  Mail,
} from 'lucide-react';

// Mock customers data
const mockCustomers = [
  {
    id: 'USR-001',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+880 1234567890',
    status: 'active',
    role: 'USER',
    totalOrders: 12,
    totalSpent: 25000,
    lastOrder: '2024-01-15T10:30:00Z',
    joinDate: '2023-06-15T08:00:00Z',
    isVerified: true,
    avatar: null,
  },
  {
    id: 'USR-002',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+880 1234567891',
    status: 'active',
    role: 'USER',
    totalOrders: 8,
    totalSpent: 18000,
    lastOrder: '2024-01-14T15:20:00Z',
    joinDate: '2023-08-20T10:30:00Z',
    isVerified: true,
    avatar: null,
  },
  {
    id: 'USR-003',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+880 1234567892',
    status: 'blocked',
    role: 'USER',
    totalOrders: 3,
    totalSpent: 5500,
    lastOrder: '2024-01-10T12:00:00Z',
    joinDate: '2023-11-05T14:15:00Z',
    isVerified: false,
    avatar: null,
  },
  {
    id: 'USR-004',
    name: 'Alice Brown',
    email: 'alice@example.com',
    phone: '+880 1234567893',
    status: 'active',
    role: 'USER',
    totalOrders: 15,
    totalSpent: 32000,
    lastOrder: '2024-01-13T09:45:00Z',
    joinDate: '2023-04-10T11:20:00Z',
    isVerified: true,
    avatar: null,
  },
  {
    id: 'USR-005',
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    phone: '+880 1234567894',
    status: 'active',
    role: 'USER',
    totalOrders: 6,
    totalSpent: 12500,
    lastOrder: '2024-01-12T16:30:00Z',
    joinDate: '2023-09-25T13:45:00Z',
    isVerified: true,
    avatar: null,
  },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'blocked', label: 'Blocked' },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'blocked':
      return 'destructive';
    default:
      return 'outline';
  }
};

export function CustomersManagement() {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter customers based on status and search
  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleStatusUpdate = (customerId: string, newStatus: string) => {
    // TODO: Implement status update API call
    console.log(`Updating customer ${customerId} to status: ${newStatus}`);
  };

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer);
  };

  const customerColumns = [
    {
      key: 'customer',
      title: 'Customer',
      sortable: true,
      render: (_: any, customer: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={customer.avatar} />
            <AvatarFallback>
              {customer.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{customer.name}</div>
            <div className="text-sm text-muted-foreground">{customer.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'id',
      title: 'Customer ID',
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: 'phone',
      title: 'Phone',
      render: (value: string) => (
        <span className="text-sm">{value}</span>
      ),
    },
    {
      key: 'totalOrders',
      title: 'Orders',
      sortable: true,
      render: (value: number) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'totalSpent',
      title: 'Total Spent',
      sortable: true,
      render: (value: number) => (
        <span className="font-medium">৳{value.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value: string, customer: any) => (
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(value)} className="capitalize">
            {value}
          </Badge>
          {customer.isVerified && (
            <Badge variant="outline" className="text-xs">
              Verified
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'joinDate',
      title: 'Join Date',
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
      render: (_: any, customer: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>
            {customer.status === 'active' ? (
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(customer.id, 'blocked')}
                className="text-destructive"
              >
                <UserX className="mr-2 h-4 w-4" />
                Block User
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => handleStatusUpdate(customer.id, 'active')}
                className="text-green-600"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Unblock User
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customers</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
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

          {/* Customers Table */}
          <DataTable
            data={filteredCustomers}
            columns={customerColumns}
            searchable={false}
            emptyMessage="No customers found"
          />
        </CardContent>
      </Card>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg max-w-2xl w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
            <p>Customer details modal will be implemented here</p>
            <Button onClick={() => setSelectedCustomer(null)} className="mt-4">
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
