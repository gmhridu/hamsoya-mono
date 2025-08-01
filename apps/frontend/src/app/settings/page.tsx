import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { redirectIfNotAuthenticated } from '@/lib/auth-redirects';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings - Hamsoya | Account Settings',
  description: 'Manage your account settings, preferences, and privacy options on Hamsoya.',
  keywords: 'settings, preferences, account settings, privacy, hamsoya',
  robots: {
    index: false,
    follow: true,
  },
};

export default async function SettingsPage() {
  // Server-side authentication check - redirects if not authenticated
  await redirectIfNotAuthenticated('/settings');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold mb-8">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Settings management features are coming soon. You will be able to manage your
              preferences here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
