/**
 * Admin Appearance Settings Page
 * Customize theme, colors, typography, and design settings
 */

import { AppearanceSettings } from '@/components/admin/appearance/appearance-settings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Appearance Settings - Hamsoya Admin | Customize Theme & Design',
  description: 'Customize website appearance, theme colors, typography, and design settings in the admin dashboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminAppearancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appearance Settings</h1>
        <p className="text-muted-foreground">
          Customize your website&apos;s theme, colors, and design elements.
        </p>
      </div>
      <AppearanceSettings />
    </div>
  );
}
