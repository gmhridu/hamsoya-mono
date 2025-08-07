'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTheme } from 'next-themes';
import type { User } from '@/types/auth';
import {
  Bell,
  ExternalLink,
  LogOut,
  Moon,
  Settings,
  Sun,
  User as UserIcon,
  Globe,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface AdminHeaderProps {
  user: User;
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const { setTheme } = useTheme();
  const router = useRouter();
  const [notificationCount, setNotificationCount] = useState(3);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleLogout = () => {
    // TODO: Implement logout functionality
    // Use regular router for logout to avoid View Transition on auth change
    router.push('/login');
  };

  const handleViewSite = () => {
    window.open('/', '_blank');
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    // TODO: Mark notifications as read
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
      {/* Left side - Logo/Title with responsive behavior */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile: Account for sidebar toggle button space */}
        <div className="w-12 lg:w-0 flex-shrink-0" />

        {/* Page Title - Responsive sizing and truncation */}
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate">
            <span className="hidden sm:inline">Admin Dashboard</span>
            <span className="sm:hidden">Admin</span>
          </h1>
        </div>
      </div>

      {/* Right side - Actions and user menu with responsive layout */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
        {/* View Site Button - Progressive disclosure */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewSite}
          className="gap-1.5 min-h-[44px] min-w-[44px] px-2 sm:px-3"
          title="View Site"
        >
          <ExternalLink className="h-4 w-4 flex-shrink-0" />
          <span className="hidden md:inline text-sm">View Site</span>
          <span className="hidden sm:inline md:hidden text-sm">Site</span>
        </Button>

        {/* Notifications with enhanced dropdown */}
        <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
          <DropdownMenuTrigger className='cursor-pointer' asChild>
            <Button
              variant="ghost"
              size="sm"
              className="relative min-h-[44px] min-w-[44px] px-2"
              title="Notifications"
              onClick={handleNotificationClick}
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs font-medium rounded-full flex items-center justify-center">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 sm:w-96">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {notificationCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {notificationCount} new
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              <DropdownMenuItem className="flex flex-col items-start p-3">
                <div className="font-medium text-sm">New order received</div>
                <div className="text-xs text-muted-foreground">Order #1234 from John Doe</div>
                <div className="text-xs text-muted-foreground mt-1">2 minutes ago</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-3">
                <div className="font-medium text-sm">Low stock alert</div>
                <div className="text-xs text-muted-foreground">Premium Honey is running low</div>
                <div className="text-xs text-muted-foreground mt-1">1 hour ago</div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-3">
                <div className="font-medium text-sm">Customer review</div>
                <div className="text-xs text-muted-foreground">5-star review on Organic Dates</div>
                <div className="text-xs text-muted-foreground mt-1">3 hours ago</div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/notifications" className="text-center w-full">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle - Enhanced with better UX */}
        <DropdownMenu>
          <DropdownMenuTrigger className='cursor-pointer' asChild>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-[44px] min-w-[44px] px-2"
              title="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Theme
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2">
              <Sun className="h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2">
              <Moon className="h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2">
              <Settings className="h-4 w-4" />
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu - Enhanced with responsive design */}
        <DropdownMenu>
          <DropdownMenuTrigger className='cursor-pointer' asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full min-h-[44px] min-w-[44px] p-0 hover:bg-muted/50"
              title={`${user.name || user.email} - ${user.role}`}
            >
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10">
                <AvatarImage
                  src={user.profile_image_url && user.profile_image_url.trim() !== '' ? user.profile_image_url : undefined}
                  alt={user.name || user.email}
                />
                <AvatarFallback className="text-sm font-medium">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 sm:w-72" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.profile_image_url && user.profile_image_url.trim() !== '' ? user.profile_image_url : undefined}
                      alt={user.name || user.email}
                    />
                    <AvatarFallback className="text-sm font-medium">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <p className="text-sm font-medium leading-none truncate">{user.name || user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground mt-1 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {user.role}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Online
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer gap-3 p-3">
                <UserIcon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm">Profile</span>
                  <span className="text-xs text-muted-foreground">Manage your account</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="cursor-pointer gap-3 p-3">
                <Settings className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm">Settings</span>
                  <span className="text-xs text-muted-foreground">Admin preferences</span>
                </div>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-3 p-3 text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="text-sm">Log out</span>
                <span className="text-xs text-muted-foreground">Sign out of your account</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
