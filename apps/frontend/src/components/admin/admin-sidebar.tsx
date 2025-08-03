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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

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

  return (
    <div
      className={cn(
        'flex flex-col bg-card border-r border-border transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-[10px] space-y-2">
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
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
