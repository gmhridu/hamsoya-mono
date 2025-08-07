'use client';

import { useState, useEffect } from 'react';
import { ViewTransitionLink } from '@/components/ui/view-transition-link';
import { Heart, ShoppingBag, Trash2, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/products/product-card';
import { useBookmarksStore } from '@/store';
import { cn } from '@/lib/utils';

interface BookmarksClientProps {
  initialBookmarkCount?: number;
}

export function BookmarksClient({ initialBookmarkCount = 0 }: BookmarksClientProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isHydrated, setIsHydrated] = useState(false);
  const { bookmarkedProducts, clearBookmarks, getBookmarkCount, isHydrated: storeIsHydrated } = useBookmarksStore();

  // Handle component hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Use server-provided count initially to prevent flashing, then switch to store count after hydration
  const bookmarkCount = isHydrated && storeIsHydrated ? getBookmarkCount() : initialBookmarkCount;

  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all bookmarks?')) {
      clearBookmarks();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
              My Bookmarks
            </h1>
            <p className="text-lg text-muted-foreground">
              {bookmarkCount > 0
                ? `${bookmarkCount} saved ${bookmarkCount === 1 ? 'product' : 'products'}`
                : 'No bookmarked products yet'
              }
            </p>
          </div>

          {bookmarkCount > 0 && (
            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        {bookmarkCount > 0 && (
          <div className="flex gap-4">
            <Badge variant="outline" className="text-sm">
              <Heart className="h-3 w-3 mr-1 fill-current text-red-500" />
              {bookmarkCount} Bookmarked
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      {bookmarkCount === 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <Heart className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Bookmarks Yet</h2>
              <p className="text-muted-foreground">
                Start exploring our products and bookmark your favorites to see them here.
              </p>
            </div>

            <div className="space-y-4">
              <Button asChild size="lg">
                <ViewTransitionLink href="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Browse Products
                </ViewTransitionLink>
              </Button>

              <div className="text-sm text-muted-foreground">
                <p>💡 Tip: Click the heart icon on any product to bookmark it</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={cn(
          'grid gap-6',
          viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        )}>
          {bookmarkedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              className={viewMode === 'list' ? 'flex-row' : ''}
            />
          ))}
        </div>
      )}

      {/* Call to Action */}
      {bookmarkCount > 0 && (
        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Ready to Order?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your bookmarked products to cart and place your order with cash on delivery.
              </p>
              <Button asChild className="w-full">
                <ViewTransitionLink href="/products">
                  Continue Shopping
                </ViewTransitionLink>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
