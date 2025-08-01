'use client';

import { ProductCard } from '@/components/products/product-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductDetailSkeleton } from '@/components/ui/loading';
import { Price } from '@/components/ui/price';
import { Rating } from '@/components/ui/rating';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuthStore, useBookmarksStore, useCartStore } from '@/store';
import { Product, Review } from '@/types';
import { Heart, Minus, Plus, RotateCcw, Share2, Shield, ShoppingCart, Truck } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ProductDetailClientProps {
  product: Product;
  reviews: Review[];
  relatedProducts: Product[];
}

export function ProductDetailClient({
  product,
  reviews,
  relatedProducts,
}: ProductDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem, isInCart, getItemQuantity } = useCartStore();
  const { toggleBookmark, isBookmarked } = useBookmarksStore();

  // For guest users, always show "not bookmarked" state to prevent hydration mismatches
  const isProductBookmarked = isAuthenticated ? isBookmarked(product.id) : false;
  const isProductInCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast.error('Product is out of stock');
      return;
    }

    addItem(product, quantity);
    toast.success(`${product.name} added to cart`);
  };

  const handleToggleBookmark = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect guest users to login immediately
      router.push('/login');
      return;
    }

    // Only process bookmark for authenticated users
    toggleBookmark(product);
    toast.success(isProductBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard');
    }
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        (((product.originalPrice ?? 0) - product.price) / (product.originalPrice ?? 1)) * 100
      )
    : 0;

  // Badge color logic matching ProductCard
  const getTagVariant = (tag: string) => {
    const lowerTag = tag.toLowerCase();
    if (lowerTag.includes('organic') || lowerTag.includes('natural')) {
      return 'success';
    }
    if (lowerTag.includes('premium') || lowerTag.includes('traditional')) {
      return 'accent';
    }
    if (lowerTag.includes('spicy') || lowerTag.includes('hot') || lowerTag.includes('spices')) {
      return 'warning';
    }
    return 'default';
  };

  // Show loading skeleton during loading state
  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={product.images[selectedImageIndex]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {!product.inStock && (
                <Badge variant="destructive" className="text-white text-center">
                  Out of Stock
                </Badge>
              )}
              {hasDiscount && (
                <Badge variant="destructive" className="text-white text-center">
                  -{discountPercentage}%
                </Badge>
              )}
              {product.featured && (
                <Badge variant="accent" className="text-white text-center">
                  Featured
                </Badge>
              )}
            </div>

            {/* Bookmark Button */}
            <Button
              variant="outline"
              size="icon"
              className={cn(
                'absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white',
                isProductBookmarked && 'opacity-100 text-red-500 hover:text-red-600'
              )}
              onClick={handleToggleBookmark}
            >
              <Heart className={cn('h-4 w-4', isProductBookmarked && 'fill-current')} />
            </Button>
          </div>

          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    'relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors',
                    index === selectedImageIndex
                      ? 'border-primary'
                      : 'border-transparent hover:border-muted-foreground'
                  )}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col h-full">
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <Rating rating={averageRating} showValue />
                <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
              </div>

              {/* Price */}
              <Price
                price={product.price}
                originalPrice={product.originalPrice}
                size="lg"
                className="mb-6"
              />

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

              {/* Tags with color-coded badges */}
              {product.tags && product.tags.length > 0 && (
                <div className="space-y-3 mb-6">
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map(tag => {
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

                  {/* Category and Origin badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {product.category}
                    </Badge>
                    {product.origin && (
                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                        {product.origin}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Product Details */}
              {(product.weight || product.origin) && (
                <div className="bg-card/70 rounded-lg p-4 mb-6 border border-border/50">
                  <h3 className="font-semibold text-sm mb-3">Product Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {product.weight && (
                      <div>
                        <span className="text-muted-foreground">Weight:</span>
                        <span className="ml-2 font-medium">{product.weight}</span>
                      </div>
                    )}
                    {product.origin && (
                      <div>
                        <span className="text-muted-foreground">Origin:</span>
                        <span className="ml-2 font-medium">{product.origin}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Benefits Preview */}
              {product.benefits && product.benefits.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-sm mb-3">Key Benefits</h3>
                  <ul className="space-y-1">
                    {product.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                    {product.benefits.length > 3 && (
                      <li className="text-xs text-muted-foreground ml-3.5">
                        +{product.benefits.length - 3} more benefits
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Stock Status */}
            {product.inStock ? (
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-green-600 font-medium">In Stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-sm text-red-600 font-medium">Out of Stock</span>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!product.inStock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {isProductInCart
                    ? `In Cart (${cartQuantity})`
                    : product.inStock
                    ? 'Add to Cart'
                    : 'Out of Stock'}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleToggleBookmark}
                  className={cn(isProductBookmarked && 'text-red-500 hover:text-red-600')}
                >
                  <Heart className={cn('h-5 w-5', isProductBookmarked && 'fill-current')} />
                </Button>

                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Product Features - moved to bottom for better balance */}
          <div className="mt-auto pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Truck className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Free Delivery</p>
                  <p className="text-xs text-muted-foreground">Across Bangladesh</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Quality Assured</p>
                  <p className="text-xs text-muted-foreground">Premium grade</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <RotateCcw className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">7-day policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="details" className="mb-16">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <Card className="bg-card/70">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Product Information</h3>
                  <dl className="space-y-2">
                    {product.weight && (
                      <>
                        <dt className="text-sm text-muted-foreground">Weight:</dt>
                        <dd className="text-sm font-medium">{product.weight}</dd>
                      </>
                    )}
                    {product.origin && (
                      <>
                        <dt className="text-sm text-muted-foreground">Origin:</dt>
                        <dd className="text-sm font-medium">{product.origin}</dd>
                      </>
                    )}
                    <dt className="text-sm text-muted-foreground">Category:</dt>
                    <dd className="text-sm font-medium capitalize">{product.category}</dd>
                    <dt className="text-sm text-muted-foreground">Availability:</dt>
                    <dd className="text-sm font-medium">
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </dd>
                  </dl>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="mt-6">
          <Card className="bg-card/70">
            <CardContent className="p-6">
              {product.benefits && product.benefits.length > 0 ? (
                <div>
                  <h3 className="font-semibold mb-4">Health Benefits</h3>
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No specific benefits listed for this product.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map(review => (
                <Card key={review.id} className="bg-card/70">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{review.userName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Rating rating={review.rating} size="sm" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {review.verified && (
                        <Badge variant="outline" className="text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-card">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No reviews yet. Be the first to review this product!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-serif font-bold mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
