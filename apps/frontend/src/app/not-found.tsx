import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ViewTransitionLink } from '@/components/ui/view-transition-link';
import { BRAND_NAME, NAVIGATION_ITEMS } from '@/lib/constants';
import { ArrowLeft, Home, Search, ShoppingBag } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: `Page Not Found | ${BRAND_NAME}`,
  description:
    'The page you are looking for could not be found. Browse our premium organic food products instead.',
  robots: 'noindex, nofollow',
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-6">
          {/* 404 Visual */}
          <div className="mx-auto mb-6 relative">
            <div className="text-8xl md:text-9xl font-serif font-bold text-primary/20 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Search className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
            </div>
          </div>

          <CardTitle className="text-2xl md:text-3xl font-serif mb-2">Page Not Found</CardTitle>
          <CardDescription className="text-base md:text-lg max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's get you back to
            discovering our premium organic products.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Primary Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild size="lg" className="w-full">
              <ViewTransitionLink href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </ViewTransitionLink>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <ViewTransitionLink href="/products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse Products
              </ViewTransitionLink>
            </Button>
          </div>

          {/* Quick Navigation */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 text-center">
              Or explore these sections:
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {NAVIGATION_ITEMS.slice(1).map(item => (
                <Button key={item.href} asChild variant="ghost" size="sm" className="justify-start">
                  <ViewTransitionLink href={item.href}>
                    <ArrowLeft className="mr-2 h-3 w-3" />
                    {item.name}
                  </ViewTransitionLink>
                </Button>
              ))}
            </div>
          </div>

          {/* Help Text */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Need help? Contact us at{' '}
              <ViewTransitionLink
                href="/contact-us"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                our support page
              </ViewTransitionLink>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
