/**
 * Admin Product Management Page
 * Comprehensive product management with CRUD operations, stock management, and featured toggles
 */

import { ProductsManagement } from '@/components/admin/products/products-management';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Management - Hamsoya Admin | Manage Product Catalog',
  description: 'Manage product catalog, update inventory, set featured products, and handle product information in the admin dashboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Management</h1>
        <p className="text-muted-foreground">
          Manage your product catalog, inventory, and product information.
        </p>
      </div>
      <ProductsManagement />
    </div>
  );
}
