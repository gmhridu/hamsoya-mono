'use client';

import { CartDrawer } from '@/components/cart/cart-drawer';
import { useServerAuth } from '@/components/providers/server-auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLogout } from '@/hooks/use-auth';
import { BRAND_NAME, NAVIGATION_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useBookmarksStore } from '@/store';
import {
  Heart,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShoppingBag,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavbarProps {
  initialCartCount?: number;
  initialBookmarkCount?: number;
}

export function Navbar({ initialCartCount = 0, initialBookmarkCount = 0 }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  const { user, isAuthenticated } = useServerAuth();
  const { getBookmarkCount, isHydrated: bookmarksHydrated } = useBookmarksStore();
  const logoutMutation = useLogout();
  const { setTheme } = useTheme();

  // Always use server-side data for instant authentication state
  const displayUser = user;
  const displayIsAuthenticated = isAuthenticated;

  // Use server-side count until client is hydrated, then use client-side count
  const bookmarkCount = bookmarksHydrated ? getBookmarkCount() : initialBookmarkCount;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.png" width={20} height={20} alt={BRAND_NAME} className="size-8" />
            <span className="font-serif text-xl font-bold text-primary">{BRAND_NAME}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAVIGATION_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-all duration-200 hover:text-primary relative',
                  pathname === item.href
                    ? 'text-primary after:absolute after:bottom-[-20px] after:left-0 after:right-0 after:h-0.5 after:bg-primary after:rounded-full'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-muted/50 border-0 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Bookmarks */}
            <Button variant="ghost" size="icon" className="relative hover:bg-accent" asChild>
              <Link href="/bookmarks">
                <Heart className="h-5 w-5" />
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 text-xs font-semibold text-white flex items-center justify-center min-w-[1rem] min-h-[1rem]"
                >
                  {bookmarkCount || 0}
                </Badge>
              </Link>
            </Button>

            {/* Cart */}
            <CartDrawer initialCartCount={initialCartCount} />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {displayIsAuthenticated ? (
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full hover:bg-accent cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={displayUser?.profile_image_url}
                        alt={displayUser?.name || 'User'}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {displayUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="hover:bg-accent cursor-pointer">
                    <UserIcon className="h-5 w-5" />
                  </Button>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 shadow-lg border-border/50 bg-background/95 backdrop-blur-sm"
              >
                {displayIsAuthenticated ? (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1 px-1 py-1">
                        <p className="text-sm font-medium leading-none text-foreground">
                          {displayUser?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {displayUser?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="flex items-center cursor-pointer transition-colors duration-200 hover:bg-accent/80 focus:bg-accent/80"
                      >
                        <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/orders"
                        className="flex items-center cursor-pointer transition-colors duration-200 hover:bg-accent/80 focus:bg-accent/80"
                      >
                        <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">My Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/settings"
                        className="flex items-center cursor-pointer transition-colors duration-200 hover:bg-accent/80 focus:bg-accent/80"
                      >
                        <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setTheme('light')}
                      className="flex items-center cursor-pointer transition-colors duration-200 hover:bg-accent/80 focus:bg-accent/80"
                    >
                      <Sun className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Light Theme</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme('dark')}
                      className="flex items-center cursor-pointer transition-colors duration-200 hover:bg-accent/80 focus:bg-accent/80"
                    >
                      <Moon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Dark Theme</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme('system')}
                      className="flex items-center cursor-pointer transition-colors duration-200 hover:bg-accent/80 focus:bg-accent/80"
                    >
                      <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">System Theme</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logoutMutation.mutate()}
                      className="flex items-center cursor-pointer transition-colors duration-200 text-red-600 hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700 dark:hover:bg-red-950/20 dark:focus:bg-red-950/20"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span className="font-medium">Logout</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/login"
                        className="flex items-center cursor-pointer transition-colors duration-200 hover:bg-accent/80 focus:bg-accent/80"
                      >
                        <LogIn className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Login/Register</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setTheme('light')}
                      className="flex items-center cursor-pointer transition-colors duration-200 hover:bg-accent/80 focus:bg-accent/80"
                    >
                      <Sun className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Light Theme</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme('dark')}
                      className="flex items-center cursor-pointer transition-colors duration-200 hover:bg-accent/80 focus:bg-accent/80"
                    >
                      <Moon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Dark Theme</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setTheme('system')}
                      className="flex items-center cursor-pointer transition-colors duration-200 hover:bg-accent/80 focus:bg-accent/80"
                    >
                      <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">System Theme</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </form>

                  {/* Mobile Navigation */}
                  <nav className="space-y-1">
                    {NAVIGATION_ITEMS.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'block px-3 py-3 text-base font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                          pathname === item.href
                            ? 'bg-accent text-accent-foreground'
                            : 'text-muted-foreground'
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile User Actions */}
                  <div className="space-y-3 pt-4 border-t">
                    {displayIsAuthenticated ? (
                      <>
                        <div className="flex items-center space-x-3 px-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={displayUser?.profile_image_url}
                              alt={displayUser?.name || 'User'}
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {displayUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{displayUser?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {displayUser?.email}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Link
                            href="/profile"
                            className="flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <UserIcon className="mr-3 h-4 w-4 text-muted-foreground" />
                            Profile
                          </Link>
                          <Link
                            href="/orders"
                            className="flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <ShoppingBag className="mr-3 h-4 w-4 text-muted-foreground" />
                            My Orders
                          </Link>
                          <Link
                            href="/settings"
                            className="flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                            Settings
                          </Link>
                        </div>
                        <div className="pt-2 border-t space-y-1">
                          <button
                            onClick={() => {
                              setTheme('light');
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground"
                          >
                            <Sun className="mr-3 h-4 w-4 text-muted-foreground" />
                            Light Theme
                          </button>
                          <button
                            onClick={() => {
                              setTheme('dark');
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground"
                          >
                            <Moon className="mr-3 h-4 w-4 text-muted-foreground" />
                            Dark Theme
                          </button>
                          <button
                            onClick={() => {
                              setTheme('system');
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground"
                          >
                            <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                            System Theme
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            logoutMutation.mutate();
                            setIsMenuOpen(false);
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          className="flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <UserIcon className="mr-3 h-4 w-4 text-muted-foreground" />
                          Login
                        </Link>
                        <div className="pt-2 border-t space-y-1">
                          <button
                            onClick={() => {
                              setTheme('light');
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground"
                          >
                            <Sun className="mr-3 h-4 w-4 text-muted-foreground" />
                            Light Theme
                          </button>
                          <button
                            onClick={() => {
                              setTheme('dark');
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground"
                          >
                            <Moon className="mr-3 h-4 w-4 text-muted-foreground" />
                            Dark Theme
                          </button>
                          <button
                            onClick={() => {
                              setTheme('system');
                              setIsMenuOpen(false);
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground"
                          >
                            <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                            System Theme
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
