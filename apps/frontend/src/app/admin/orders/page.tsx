/**
 * Admin Orders Management Page
 * Comprehensive order management with filtering, search, and status updates
 */

import { OrdersManagement } from '@/components/admin/orders/orders-management';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Management - Hamsoya Admin | Manage Customer Orders',
  description: 'Manage customer orders, update order status, and track deliveries in the admin dashboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground">
          Manage customer orders, update status, and track deliveries.
        </p>
      </div>
      <OrdersManagement />
    </div>
  );
}
