/**
 * Dashboard page with server-side protected route access
 * Uses server-side authentication to prevent content flashing
 */

import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { getUserOrRedirect } from '@/lib/auth-redirects';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Hamsoya | Your Account Overview',
  description: 'Manage your orders, bookmarks, and account settings in your personal dashboard.',
  keywords: 'dashboard, account, orders, bookmarks, profile, hamsoya',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Protected dashboard page that requires authentication
 * Uses server-side authentication to prevent content flashing
 */
export default async function DashboardPage() {
  // Server-side authentication check - gets user or redirects if not authenticated
  const user = await getUserOrRedirect('/dashboard');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <DashboardContent user={user} />
      </div>
    </div>
  );
}
