/**
 * Admin Dashboard Layout
 * Provides the main layout structure for all admin pages
 * Includes sidebar navigation, header, and content area with enhanced loading states
 */

import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminLayoutClient } from '@/components/admin/admin-layout-client';
import { ServerAuthProvider } from '@/components/auth/server-auth-provider';
import { getServerAdminAuthState } from '@/lib/server-auth-state';
import { ReactNode } from 'react';
import '@/styles/admin-responsive.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // OPTIMIZATION: Get server-validated authentication state
  // This eliminates redundant database calls and provides instant client hydration
  const authState = await getServerAdminAuthState();

  // DEBUG: Log server-side auth state
  console.log('AdminLayout - Server auth state:', authState.isAuthenticated ?
    { id: authState.user?.id, role: authState.user?.role, email: authState.user?.email } :
    'Not authenticated'
  );

  // If no authenticated admin user, delegate to client component
  if (!authState.isAuthenticated || !authState.user) {
    console.log('AdminLayout - No authenticated admin user, delegating to client component');
    return (
      <ServerAuthProvider initialUser={null} isAuthenticated={false}>
        <AdminLayoutClient initialUser={null}>{children}</AdminLayoutClient>
      </ServerAuthProvider>
    );
  }

  console.log('AdminLayout - Admin user authenticated, rendering admin layout with server state');

  // Pass server-validated user data to client components
  return (
    <ServerAuthProvider initialUser={authState.user} isAuthenticated={true}>
      <AdminLayoutClient initialUser={authState.user}>{children}</AdminLayoutClient>
    </ServerAuthProvider>
  );
}
