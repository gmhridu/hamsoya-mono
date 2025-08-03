/**
 * Admin System Settings Page
 * General system settings, business information, and configuration
 */

import { SystemSettings } from '@/components/admin/settings/system-settings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Settings - Hamsoya Admin | General Configuration',
  description: 'Configure general system settings, business information, and admin preferences.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Configure general system settings and business information.
        </p>
      </div>
      <SystemSettings />
    </div>
  );
}
