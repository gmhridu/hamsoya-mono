/**
 * Admin Category Management Page
 * Manage product categories with add/edit/delete functionality and visibility controls
 */

import { CategoriesManagement } from '@/components/admin/categories/categories-management';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Category Management - Hamsoya Admin | Manage Product Categories',
  description: 'Manage product categories, organize catalog structure, and control category visibility in the admin dashboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
        <p className="text-muted-foreground">
          Organize your product catalog by managing categories and their visibility.
        </p>
      </div>
      <CategoriesManagement />
    </div>
  );
}
