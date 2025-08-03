/**
 * Admin Customer Management Page
 * Comprehensive customer management with profiles, order history, and user controls
 */

import { CustomersManagement } from '@/components/admin/customers/customers-management';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Management - Hamsoya Admin | Manage Users & Profiles',
  description: 'Manage customer accounts, view order history, and control user access in the admin dashboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
        <p className="text-muted-foreground">
          Manage customer accounts, view profiles, and track customer activity.
        </p>
      </div>
      <CustomersManagement />
    </div>
  );
}
