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
  Download,
  Filter,
  Search,
  Calendar,
  User,
  Activity,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
} from 'lucide-react';

// Mock activity logs data
const mockLogs = [
  {
    id: 'LOG-001',
    timestamp: '2024-01-15T10:30:00Z',
    user: 'Admin User',
    action: 'Order Status Updated',
    description: 'Changed order ORD-001 status from pending to confirmed',
    type: 'order',
    level: 'info',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  {
    id: 'LOG-002',
    timestamp: '2024-01-15T10:25:00Z',
    user: 'Admin User',
    action: 'Product Created',
    description: 'Created new product: Premium Honey',
    type: 'product',
    level: 'success',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  {
    id: 'LOG-003',
    timestamp: '2024-01-15T10:20:00Z',
    user: 'System',
    action: 'Low Stock Alert',
    description: 'Product "Organic Dates" is running low (5 items left)',
    type: 'system',
    level: 'warning',
    ipAddress: 'system',
    userAgent: 'system',
  },
  {
    id: 'LOG-004',
    timestamp: '2024-01-15T10:15:00Z',
    user: 'Admin User',
    action: 'User Login',
    description: 'Admin user logged in successfully',
    type: 'auth',
    level: 'info',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  {
    id: 'LOG-005',
    timestamp: '2024-01-15T10:10:00Z',
    user: 'System',
    action: 'Backup Completed',
    description: 'Daily database backup completed successfully',
    type: 'system',
    level: 'success',
    ipAddress: 'system',
    userAgent: 'system',
  },
  {
    id: 'LOG-006',
    timestamp: '2024-01-15T10:05:00Z',
    user: 'Admin User',
    action: 'Customer Blocked',
    description: 'Blocked customer account: john@example.com',
    type: 'user',
    level: 'warning',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  {
    id: 'LOG-007',
    timestamp: '2024-01-15T10:00:00Z',
    user: 'System',
    action: 'Failed Login Attempt',
    description: 'Failed login attempt for user: admin@hamsoya.com',
    type: 'auth',
    level: 'error',
    ipAddress: '192.168.1.200',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
];

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'auth', label: 'Authentication' },
  { value: 'order', label: 'Orders' },
  { value: 'product', label: 'Products' },
  { value: 'user', label: 'Users' },
  { value: 'system', label: 'System' },
];

const levelOptions = [
  { value: 'all', label: 'All Levels' },
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
];

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'success':
      return CheckCircle;
    case 'warning':
      return AlertCircle;
    case 'error':
      return XCircle;
    default:
      return Info;
  }
};

const getLevelVariant = (level: string) => {
  switch (level) {
    case 'success':
      return 'default';
    case 'warning':
      return 'outline';
    case 'error':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'auth':
      return User;
    case 'order':
    case 'product':
    case 'user':
      return Activity;
    default:
      return Activity;
  }
};

export function ActivityLogs() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('today');

  // Filter logs based on filters and search
  const filteredLogs = mockLogs.filter((log) => {
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesLevel && matchesSearch;
  });

  const logColumns = [
    {
      key: 'timestamp',
      title: 'Time',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm">
          {new Date(value).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      key: 'level',
      title: 'Level',
      render: (value: string) => {
        const Icon = getLevelIcon(value);
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <Badge variant={getLevelVariant(value)} className="capitalize">
              {value}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'type',
      title: 'Type',
      render: (value: string) => {
        const Icon = getTypeIcon(value);
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="capitalize">
              {value}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'user',
      title: 'User',
      sortable: true,
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'action',
      title: 'Action',
      sortable: true,
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      render: (value: string) => (
        <span className="text-sm text-muted-foreground max-w-md truncate">
          {value}
        </span>
      ),
    },
    {
      key: 'ipAddress',
      title: 'IP Address',
      render: (value: string) => (
        <span className="text-sm font-mono">
          {value === 'system' ? 'System' : value}
        </span>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Logs
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Logs
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by action, description, or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {levelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[130px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Logs Table */}
        <DataTable
          data={filteredLogs}
          columns={logColumns}
          searchable={false}
          emptyMessage="No activity logs found"
        />
      </CardContent>
    </Card>
  );
}
