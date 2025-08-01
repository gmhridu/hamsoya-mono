import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { redirectIfNotAuthenticated } from '@/lib/auth-redirects';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile - Hamsoya | Manage Your Account',
  description:
    'Manage your Hamsoya account profile, update personal information, and view account details.',
  keywords: 'profile, account, user settings, hamsoya',
  robots: {
    index: false,
    follow: true,
  },
};

export default async function ProfilePage() {
  // Server-side authentication check - redirects if not authenticated
  await redirectIfNotAuthenticated('/profile');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold mb-8">My Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Profile management features are coming soon. You can update your profile information
              here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
