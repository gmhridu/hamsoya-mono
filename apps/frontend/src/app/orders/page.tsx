import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Orders - Hamsoya | Order History',
  description:
    'View your order history, track current orders, and manage your purchases on Hamsoya.',
  keywords: 'orders, order history, tracking, purchases, hamsoya',
  robots: {
    index: false,
    follow: true,
  },
};

export default async function OrdersPage() {
  // Server-side authentication check - redirects if not authenticated
  await redirectIfNotAuthenticated('/orders');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-serif font-bold mb-8">My Orders</h1>

        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Order management features are coming soon. You will be able to view and track your
              orders here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
