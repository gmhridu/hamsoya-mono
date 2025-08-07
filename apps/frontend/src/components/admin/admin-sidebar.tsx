'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth';
import {
  BarChart3,
  Home,
  Package,
  ShoppingCart,
  Users,
  FolderTree,
  Palette,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface AdminSidebarProps {
  user: User;
}

const navigationItems = [
  {
    title: 'Overview',
    href: '/admin',
    icon: BarChart3,
    description: 'Dashboard overview and analytics',
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    description: 'Manage customer orders',
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
    description: 'Customer management',
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
    description: 'Product catalog management',
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: FolderTree,
    description: 'Category management',
  },
  {
    title: 'Home Content',
    href: '/admin/home-content',
    icon: Home,
    description: 'Homepage content editor',
  },
  {
    title: 'Appearance',
    href: '/admin/appearance',
    icon: Palette,
    description: 'Theme and design settings',
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System settings',
  },
  {
    title: 'Logs',
    href: '/admin/logs',
    icon: FileText,
    description: 'Activity logs and monitoring',
  },
];

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('admin-sidebar');
      const mobileToggle = document.getElementById('mobile-sidebar-toggle');

      if (
        isMobileOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        mobileToggle &&
        !mobileToggle.contains(event.target as Node)
      ) {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <Button
        id="mobile-sidebar-toggle"
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden h-10 w-10 p-0"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        id="admin-sidebar"
        className={cn(
          'flex flex-col bg-card border-r border-border transition-all duration-300 cursor-pointer',
          // Desktop styles
          'hidden lg:flex',
          isCollapsed ? 'lg:w-16' : 'lg:w-64',
          // Mobile styles
          'lg:relative lg:translate-x-0',
          // Mobile overlay styles
          isMobileOpen && 'fixed inset-y-0 left-0 z-50 w-64 flex lg:hidden'
        )}
      >
      {/* Logo and collapse toggle */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">H</span>
            </div>
            <span className="font-serif font-semibold text-lg">Hamsoya Admin</span>
          </div>
        )}
        {/* Desktop collapse toggle - hidden on mobile */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 hidden lg:flex"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(false)}
          className="h-8 w-8 p-0 lg:hidden"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-[10px] space-y-2 cursor-pointer">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 h-10',
                  isCollapsed && 'px-2',
                  isActive && 'bg-primary text-primary-foreground'
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="truncate">{item.title}</span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium text-sm">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name || user.email}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
