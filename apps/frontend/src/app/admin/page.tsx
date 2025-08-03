/**
 * Admin Dashboard Overview Page
 * Main dashboard with KPIs, charts, and recent activity
 */

import { AdminDashboardContent } from '@/components/admin/admin-dashboard-content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Hamsoya | Overview & Analytics',
  description: 'Admin dashboard overview with sales analytics, order management, and system monitoring.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminDashboardPage() {
  return <AdminDashboardContent />;
}
