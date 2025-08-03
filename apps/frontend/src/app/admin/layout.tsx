/**
 * Admin Dashboard Layout
 * Provides the main layout structure for all admin pages
 * Includes sidebar navigation, header, and content area
 */

import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { requireAdmin } from '@/lib/server-auth';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Ensure only admin users can access admin routes
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <AdminSidebar user={user} />
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <AdminHeader user={user} />
          
          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
