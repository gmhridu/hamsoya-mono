'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/admin/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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
import {
  Eye,
  MoreHorizontal,
  Plus,
  Download,
  Filter,
  Search,
  Edit,
  Trash2,
  Star,
  Package,
  Image as ImageIcon,
} from 'lucide-react';

// Mock products data
const mockProducts = [
  {
    id: 'PRD-001',
    name: 'Premium Honey',
    description: 'Pure natural honey from organic farms',
    price: 800,
    originalPrice: 1000,
    category: 'Honey',
    stock: 45,
    featured: true,
    inStock: true,
    isActive: true,
    images: ['/api/placeholder/200/200'],
    weight: '500g',
    origin: 'Sundarbans',
    benefits: ['Natural sweetener', 'Rich in antioxidants'],
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'PRD-002',
    name: 'Organic Dates',
    description: 'Fresh organic dates imported from Middle East',
    price: 600,
    originalPrice: 700,
    category: 'Dates',
    stock: 23,
    featured: false,
    inStock: true,
    isActive: true,
    images: ['/api/placeholder/200/200'],
    weight: '1kg',
    origin: 'Saudi Arabia',
    benefits: ['High in fiber', 'Natural energy source'],
    createdAt: '2024-01-08T10:30:00Z',
  },
  {
    id: 'PRD-003',
    name: 'Mixed Nuts',
    description: 'Premium quality mixed nuts for healthy snacking',
    price: 300,
    originalPrice: 350,
    category: 'Nuts',
    stock: 67,
    featured: true,
    inStock: true,
    isActive: true,
    images: ['/api/placeholder/200/200'],
    weight: '250g',
    origin: 'California',
    benefits: ['Protein rich', 'Heart healthy'],
    createdAt: '2024-01-05T14:15:00Z',
  },
  {
    id: 'PRD-004',
    name: 'Olive Oil',
    description: 'Extra virgin olive oil for cooking and health',
    price: 1200,
    originalPrice: 1400,
    category: 'Oil',
    stock: 0,
    featured: false,
    inStock: false,
    isActive: true,
    images: ['/api/placeholder/200/200'],
    weight: '500ml',
    origin: 'Italy',
    benefits: ['Heart healthy', 'Rich in antioxidants'],
    createdAt: '2024-01-03T09:20:00Z',
  },
  {
    id: 'PRD-005',
    name: 'Black Seed Oil',
    description: 'Pure black seed oil with natural healing properties',
    price: 900,
    originalPrice: 1100,
    category: 'Oil',
    stock: 15,
    featured: false,
    inStock: true,
    isActive: false,
    images: ['/api/placeholder/200/200'],
    weight: '100ml',
    origin: 'Egypt',
    benefits: ['Immune support', 'Anti-inflammatory'],
    createdAt: '2024-01-01T11:45:00Z',
  },
];

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'Honey', label: 'Honey' },
  { value: 'Dates', label: 'Dates' },
  { value: 'Nuts', label: 'Nuts' },
  { value: 'Oil', label: 'Oil' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const stockOptions = [
  { value: 'all', label: 'All Stock' },
  { value: 'inStock', label: 'In Stock' },
  { value: 'outOfStock', label: 'Out of Stock' },
  { value: 'lowStock', label: 'Low Stock' },
];

export function ProductsManagement() {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products based on filters and search
  const filteredProducts = mockProducts.filter((product) => {
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && product.isActive) ||
      (statusFilter === 'inactive' && !product.isActive);
    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'inStock' && product.inStock) ||
      (stockFilter === 'outOfStock' && !product.inStock) ||
      (stockFilter === 'lowStock' && product.stock > 0 && product.stock < 30);
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesStatus && matchesStock && matchesSearch;
  });

  const handleToggleFeatured = (productId: string) => {
    // TODO: Implement featured toggle API call
    console.log(`Toggling featured status for product ${productId}`);
  };

  const handleToggleStatus = (productId: string) => {
    // TODO: Implement status toggle API call
    console.log(`Toggling active status for product ${productId}`);
  };

  const handleStockUpdate = (productId: string, newStock: number) => {
    // TODO: Implement stock update API call
    console.log(`Updating stock for product ${productId} to ${newStock}`);
  };

  const productColumns = [
    {
      key: 'product',
      title: 'Product',
      render: (_: any, product: any) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-muted-foreground">{product.id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: 'price',
      title: 'Price',
      sortable: true,
      render: (value: number, product: any) => (
        <div>
          <div className="font-medium">৳{value.toLocaleString()}</div>
          {product.originalPrice > value && (
            <div className="text-sm text-muted-foreground line-through">
              ৳{product.originalPrice.toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      title: 'Stock',
      sortable: true,
      render: (value: number) => (
        <Badge
          variant={value === 0 ? 'destructive' : value < 30 ? 'outline' : 'default'}
        >
          {value === 0 ? 'Out of Stock' : `${value} units`}
        </Badge>
      ),
    },
    {
      key: 'featured',
      title: 'Featured',
      render: (value: boolean, product: any) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={value}
            onCheckedChange={() => handleToggleFeatured(product.id)}
          />
          {value && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
        </div>
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (value: boolean, product: any) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={value}
            onCheckedChange={() => handleToggleStatus(product.id)}
          />
          <Badge variant={value ? 'default' : 'secondary'}>
            {value ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, product: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Package className="mr-2 h-4 w-4" />
              Update Stock
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <CardTitle className="text-lg sm:text-xl">Products</CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none min-h-[44px]">
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" className="flex-1 sm:flex-none min-h-[44px]">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Filters - Responsive layout */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, description, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[150px] h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[130px] h-10">
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
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stockOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Table */}
        <DataTable
          data={filteredProducts}
          columns={productColumns}
          searchable={false}
          emptyMessage="No products found"
          keyField="id"
        />
      </CardContent>
    </Card>
  );
}
