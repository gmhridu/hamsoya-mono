'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Price } from '@/components/ui/price';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CartDrawerProps {
  initialCartCount?: number;
}

export function CartDrawer({ initialCartCount = 0 }: CartDrawerProps) {
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const {
    items,
    isOpen,
    openCart,
    closeCart,
    updateQuantity,
    removeItem,
    getTotalItems,
    getTotalPrice,
    isHydrated: storeIsHydrated,
  } = useCartStore();

  // Use md breakpoint (768px) for desktop vs mobile behavior
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Prevent hydration mismatch by only showing cart data after client hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Use store hydration state combined with component hydration state
  const isFullyHydrated = isHydrated && storeIsHydrated;
  const totalItems = isFullyHydrated ? getTotalItems() : 0;
  const totalPrice = isFullyHydrated ? getTotalPrice() : 0;

  // Handle cart open/close state changes
  const handleOpenChange = (open: boolean) => {
    if (open) {
      openCart();
    } else {
      closeCart();
    }
  };

  const CartContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {!isFullyHydrated || items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              Discover our premium organic products and add them to your cart
            </p>
            <Button asChild onClick={closeCart} className="w-full max-w-xs">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="p-4">
            <div className="space-y-4">
              {isHydrated &&
                items.map((item, index) => (
                  <div
                    key={item.product.id}
                    className={cn(
                      'flex gap-4 p-3 rounded-lg bg-card/50 border border-border/50 hover:bg-card/80 transition-all duration-200',
                      index !== items.length - 1 && 'mb-3'
                    )}
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border/20">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover transition-none"
                        priority
                        sizes="80px"
                      />
                    </div>

                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm leading-tight line-clamp-2">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center justify-between">
                          <Price price={item.product.price} size="sm" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            Subtotal:{' '}
                            <Price
                              price={item.product.price * item.quantity}
                              size="sm"
                              className="font-medium"
                            />
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 transition-all duration-200 hover:bg-destructive/20 hover:border-destructive/40 hover:text-destructive"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <span className="w-10 text-center text-sm font-semibold bg-muted/50 py-1 px-2 rounded transition-all duration-200">
                            {item.quantity}
                          </span>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 transition-all duration-200 hover:bg-primary/20 hover:border-primary/40 hover:text-primary"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/20 transition-all duration-200"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {isHydrated && items.length > 0 && (
        <div className="border-t bg-background/50 backdrop-blur-sm p-4 space-y-4 transition-all duration-200">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="transition-all duration-200">Items ({totalItems})</span>
              <div className="transition-all duration-200">
                <Price price={totalPrice} size="sm" />
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <div className="transition-all duration-200">
                <Price price={totalPrice} size="lg" className="text-primary" />
              </div>
            </div>
          </div>

          <Button
            className="w-full transition-all duration-200"
            size="lg"
            onClick={() => {
              closeCart();
              router.push('/order');
            }}
          >
            Proceed to Checkout
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Cash on delivery available • Free shipping across Bangladesh
          </p>
        </div>
      )}
    </div>
  );

  const trigger = (
    <Button variant="ghost" size="icon" className="relative hover:bg-accent cursor-pointer">
      <ShoppingBag className="h-5 w-5 cursor-pointer" />
      <Badge
        variant="destructive"
        className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-xs font-semibold text-white flex items-center justify-center min-w-[1rem] min-h-[1rem]"
      >
        {isFullyHydrated ? totalItems || 0 : initialCartCount}
      </Badge>
    </Button>
  );

  // Desktop: Use Sheet (side drawer)
  if (isDesktop) {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-left">
              Shopping Cart {totalItems > 0 && `(${totalItems})`}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <CartContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Mobile: Use Drawer (bottom sheet)
  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="max-h-[85vh] flex flex-col">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="text-center">
            Shopping Cart {totalItems > 0 && `(${totalItems})`}
          </DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-hidden">
          <CartContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
