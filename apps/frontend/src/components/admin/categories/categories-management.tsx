'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/admin/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  FolderTree,
  Image as ImageIcon,
} from 'lucide-react';

// Mock categories data
const mockCategories = [
  {
    id: 'CAT-001',
    name: 'Honey',
    description: 'Pure natural honey products from organic farms',
    slug: 'honey',
    image: '/api/placeholder/200/200',
    isActive: true,
    productCount: 15,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'CAT-002',
    name: 'Dates',
    description: 'Fresh organic dates from premium sources',
    slug: 'dates',
    image: '/api/placeholder/200/200',
    isActive: true,
    productCount: 8,
    createdAt: '2024-01-02T09:15:00Z',
    updatedAt: '2024-01-14T14:20:00Z',
  },
  {
    id: 'CAT-003',
    name: 'Nuts',
    description: 'Premium quality nuts for healthy snacking',
    slug: 'nuts',
    image: '/api/placeholder/200/200',
    isActive: true,
    productCount: 12,
    createdAt: '2024-01-03T10:30:00Z',
    updatedAt: '2024-01-13T16:45:00Z',
  },
  {
    id: 'CAT-004',
    name: 'Oil',
    description: 'Natural oils for cooking and health benefits',
    slug: 'oil',
    image: '/api/placeholder/200/200',
    isActive: false,
    productCount: 6,
    createdAt: '2024-01-04T11:45:00Z',
    updatedAt: '2024-01-12T12:30:00Z',
  },
  {
    id: 'CAT-005',
    name: 'Spices',
    description: 'Aromatic spices and seasonings',
    slug: 'spices',
    image: '/api/placeholder/200/200',
    isActive: true,
    productCount: 20,
    createdAt: '2024-01-05T13:00:00Z',
    updatedAt: '2024-01-11T15:15:00Z',
  },
];

interface CategoryFormData {
  name: string;
  description: string;
  slug: string;
  image: string;
  isActive: boolean;
}

export function CategoriesManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    slug: '',
    image: '',
    isActive: true,
  });

  // Filter categories based on search
  const filteredCategories = mockCategories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleStatus = (categoryId: string) => {
    // TODO: Implement status toggle API call
    console.log(`Toggling active status for category ${categoryId}`);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      slug: category.slug,
      image: category.image,
      isActive: category.isActive,
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    // TODO: Implement delete API call
    console.log(`Deleting category ${categoryId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      // TODO: Implement update API call
      console.log('Updating category:', formData);
    } else {
      // TODO: Implement create API call
      console.log('Creating category:', formData);
    }
    setIsAddDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      slug: '',
      image: '',
      isActive: true,
    });
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }));
  };

  const categoryColumns = [
    {
      key: 'category',
      title: 'Category',
      render: (_: any, category: any) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{category.name}</div>
            <div className="text-sm text-muted-foreground">/{category.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      render: (value: string) => (
        <div className="max-w-xs">
          <p className="text-sm text-muted-foreground truncate">{value}</p>
        </div>
      ),
    },
    {
      key: 'productCount',
      title: 'Products',
      sortable: true,
      render: (value: number) => (
        <Badge variant="outline">{value} products</Badge>
      ),
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (value: boolean, category: any) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={value}
            onCheckedChange={() => handleToggleStatus(category.id)}
          />
          <Badge variant={value ? 'default' : 'secondary'}>
            {value ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      title: 'Last Updated',
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
      render: (_: any, category: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(category)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Category
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(category.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Category
            </DropdownMenuItem>
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
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Categories
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="category-slug"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter category description"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">
                      {editingCategory ? 'Update' : 'Create'} Category
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        setEditingCategory(null);
                        setFormData({
                          name: '',
                          description: '',
                          slug: '',
                          image: '',
                          isActive: true,
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories Table */}
          <DataTable
            data={filteredCategories}
            columns={categoryColumns}
            searchable={false}
            emptyMessage="No categories found"
          />
        </CardContent>
      </Card>
    </>
  );
}
