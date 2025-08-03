/**
 * Admin Activity Logs Page
 * System activity monitoring and admin action logs
 */

import { ActivityLogs } from '@/components/admin/logs/activity-logs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activity Logs - Hamsoya Admin | System Monitoring',
  description: 'Monitor system activity, admin actions, and track changes in the admin dashboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
        <p className="text-muted-foreground">
          Monitor system activity and track admin actions.
        </p>
      </div>
      <ActivityLogs />
    </div>
  );
}
