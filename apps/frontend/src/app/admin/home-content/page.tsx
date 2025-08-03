/**
 * Admin Homepage Content Editor Page
 * Manage homepage content including hero section, USP highlights, and customer reviews
 */

import { HomeContentEditor } from '@/components/admin/home-content/home-content-editor';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Homepage Content - Hamsoya Admin | Edit Homepage Sections',
  description: 'Edit homepage content including hero section, USP highlights, customer reviews, and other homepage elements.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminHomeContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Homepage Content Editor</h1>
        <p className="text-muted-foreground">
          Customize your homepage content, hero section, and featured elements.
        </p>
      </div>
      <HomeContentEditor />
    </div>
  );
}
