'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Price } from '@/components/ui/price';
import { cn } from '@/lib/utils';
import { useBookmarksStore, useCartStore } from '@/store';
import { Product } from '@/types';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, isInCart, getItemQuantity } = useCartStore();
  const { toggleBookmark, isBookmarked } = useBookmarksStore();

  const isProductBookmarked = isBookmarked(product.id);
  const isProductInCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);

  // Detect if this is list view mode
  const isListView = className?.includes('flex-row');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product.inStock) {
      toast.error('Product is out of stock');
      return;
    }

    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleBookmark(product);
    toast.success(isProductBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        (((product.originalPrice ?? 0) - product.price) / (product.originalPrice ?? 1)) * 100
      )
    : 0;

  // List view layout
  if (isListView) {
    return (
      <Card className="group overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-lg flex min-h-[220px]">
        <Link href={`/products/${product.id}`} className="flex w-full">
          {/* Image section */}
          <div className="relative overflow-hidden w-[240px] flex-shrink-0 p-3">
            <div className="relative h-[256px] w-full rounded-lg overflow-hidden bg-gray-50">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                priority
                className="object-center transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {!product.inStock && (
                <Badge
                  variant="destructive"
                  className="bg-red-600 text-white shadow-lg border-0 text-xs px-2 py-0.5 font-medium"
                >
                  Out of Stock
                </Badge>
              )}
              {hasDiscount && (
                <Badge
                  variant="destructive"
                  className="bg-red-600 text-white shadow-lg font-bold border-0 text-xs px-1.5 py-0.5 min-w-0 flex items-center justify-center"
                >
                  -{discountPercentage}%
                </Badge>
              )}
              {product.featured && (
                <Badge
                  variant="accent"
                  className="bg-accent text-white shadow-lg border-0 text-xs px-2 py-0.5 font-medium"
                >
                  Featured
                </Badge>
              )}
            </div>

            {/* Bookmark button */}
            <button
              onClick={handleToggleBookmark}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-300 hover:scale-110"
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-colors',
                  isProductBookmarked
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-600 hover:text-red-500'
                )}
              />
            </button>
          </div>

          {/* Content section */}
          <div className="py-4 px-4 flex-1 flex flex-col justify-between min-h-0">
            <div className="flex-1 space-y-2">
              {/* Product name */}
              <h3 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {product.description}
              </p>

              {/* Tags with improved styling matching grid view */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {product.tags.slice(0, 3).map(tag => {
                    // Determine badge variant based on tag content (same logic as grid view)
                    const getTagVariant = (tagName: string) => {
                      const lowerTag = tagName.toLowerCase();
                      if (lowerTag.includes('organic') || lowerTag.includes('natural')) {
                        return 'success';
                      }
                      if (lowerTag.includes('premium') || lowerTag.includes('traditional')) {
                        return 'accent';
                      }
                      if (
                        lowerTag.includes('spicy') ||
                        lowerTag.includes('hot') ||
                        lowerTag.includes('spices')
                      ) {
                        return 'warning';
                      }
                      return 'default';
                    };

                    const variant = getTagVariant(tag);

                    return (
                      <Badge
                        key={tag}
                        variant={variant}
                        className="text-xs font-medium border-0 shadow-sm"
                      >
                        {tag}
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Category and Origin badges */}
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {product.category}
                </Badge>
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  {product.origin}
                </Badge>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3.5 w-3.5 transition-colors',
                      i < 4
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'
                    )}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1.5 font-medium">(4.0)</span>
              </div>

              {/* Price */}
              <Price price={product.price} originalPrice={product.originalPrice} size="md" />
            </div>

            <div className="mt-4 space-y-2">
              {/* Stock Status */}
              <div className="flex items-center gap-2 text-xs">
                {product.inStock ? (
                  <>
                    <span className="text-green-600 font-medium">✓ In Stock</span>
                    <span className="text-orange-600 font-medium">Only 8 left</span>
                  </>
                ) : (
                  <span className="text-red-600 font-medium">✗ Out Of Stock</span>
                )}
              </div>

              {/* Add to Cart Button - not full width as requested */}
              <div className="flex justify-start">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="h-9 font-medium transition-all duration-300 text-sm px-6"
                  variant={isProductInCart ? 'outline' : 'default'}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {isProductInCart
                    ? `In Cart (${cartQuantity})`
                    : product.inStock
                    ? 'Add to Cart'
                    : 'Out of Stock'}
                </Button>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    );
  }

  // Grid view layout (original)
  return (
    <Card
      className={cn(
        'group overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] rounded-lg py-0 gap-0',
        className
      )}
    >
      <Link href={`/products/${product.id}`}>
        <CardContent className="p-0">
          <div className="relative overflow-hidden">
            <div className="relative h-[355px] max-h-full w-full">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                priority
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            {/* Subtle overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent group-hover:from-black/10 transition-all duration-300" />

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5">
              {!product.inStock && (
                <Badge
                  variant="destructive"
                  className="bg-red-600 text-white shadow-md border-0 text-xs px-2 py-0.5 font-medium"
                >
                  Out of Stock
                </Badge>
              )}
              {hasDiscount && (
                <Badge
                  variant="destructive"
                  className="bg-red-600 text-white shadow-md font-bold border-0 text-xs px-1.5 py-0.5 min-w-0 flex items-center justify-center"
                >
                  -{discountPercentage}%
                </Badge>
              )}
              {product.featured && (
                <Badge
                  variant="accent"
                  className="bg-accent text-white shadow-md border-0 text-xs px-2 py-0.5 font-medium"
                >
                  Featured
                </Badge>
              )}
            </div>

            {/* Bookmark Button */}
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'absolute top-3 right-3 h-9 w-9 opacity-0 group-hover:opacity-100 transition-all duration-300 border-2 shadow-md',
                isProductBookmarked
                  ? 'opacity-100 bg-primary border-primary text-white hover:bg-primary/90'
                  : 'bg-white/95 border-white/95 text-gray-700 hover:bg-primary hover:border-primary hover:text-white'
              )}
              onClick={handleToggleBookmark}
            >
              <Heart
                className={cn(
                  'h-4 w-4 transition-all duration-300',
                  isProductBookmarked && 'fill-current'
                )}
              />
            </Button>
          </div>

          <div className="p-4 pb-3">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {product.name}
            </h3>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
              {product.description}
            </p>

            {/* Tags with improved styling */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {product.tags.slice(0, 2).map(tag => {
                  // Determine badge variant based on tag content
                  const getTagVariant = (tagName: string) => {
                    const lowerTag = tagName.toLowerCase();
                    if (lowerTag.includes('organic') || lowerTag.includes('natural')) {
                      return 'success';
                    }
                    if (lowerTag.includes('premium') || lowerTag.includes('traditional')) {
                      return 'accent';
                    }
                    if (lowerTag.includes('spicy') || lowerTag.includes('hot')) {
                      return 'warning';
                    }
                    return 'default';
                  };

                  return (
                    <Badge
                      key={tag}
                      variant={getTagVariant(tag)}
                      className="text-xs font-medium border-0 shadow-sm"
                    >
                      {tag}
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Rating with improved styling */}
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3.5 w-3.5 transition-colors',
                    i < 4
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'
                  )}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1.5 font-medium">(4.0)</span>
            </div>

            <Price
              price={product.price}
              originalPrice={product.originalPrice}
              size="md"
              className="mb-3"
            />

            {/* Additional Product Information */}
            <div className="space-y-2">
              {/* Weight/Size Information */}
              {product.weight && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">Size:</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium text-gray-700">
                    {product.weight}
                  </span>
                </div>
              )}

              {/* Origin Information */}
              {product.origin && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">Origin:</span>
                  <span className="text-gray-700">{product.origin}</span>
                </div>
              )}

              {/* Stock Status with simulated quantity */}
              <div className="flex items-center gap-2 text-xs">
                {product.inStock ? (
                  <>
                    <span className="text-green-600 font-medium">✓ In Stock</span>
                    <span className="text-orange-600 font-medium">Only 8 left</span>
                  </>
                ) : (
                  <span className="text-red-600 font-medium">✗ Out Of Stock</span>
                )}
              </div>

              {/* Key Benefit Highlight */}
              {product.benefits && product.benefits.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Key Benefit:</span>
                  <span className="ml-1 text-gray-700">{product.benefits[0]}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>

      <CardFooter className="p-4 pt-1">
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full h-10 font-medium transition-all duration-300"
          variant={isProductInCart ? 'outline' : 'default'}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isProductInCart
            ? `In Cart (${cartQuantity})`
            : product.inStock
            ? 'Add to Cart'
            : 'Out of Stock'}
        </Button>
      </CardFooter>
    </Card>
  );
}
