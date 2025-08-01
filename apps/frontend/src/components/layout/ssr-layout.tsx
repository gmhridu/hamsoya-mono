/**
 * SSR Layout Component
 * Handles server-side rendering with immediate hydration
 * Eliminates all client-side loading states and flashing
 */

import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { ServerHydrationProvider } from '@/components/providers/server-hydration-provider';
import type { ServerStorageData } from '@/lib/server-storage';
import { User } from '@/types/auth';
import { ReactNode } from 'react';

interface SSRLayoutProps {
  children: ReactNode;
  user?: User | null;
  serverStorage?: ServerStorageData;
  showNavbar?: boolean;
  showFooter?: boolean;
  className?: string;
}

export function SSRLayout({
  children,
  user = null,
  serverStorage,
  showNavbar = true,
  showFooter = true,
  className = '',
}: SSRLayoutProps) {
  return (
    <ServerHydrationProvider serverStorage={serverStorage}>
      <div className={`min-h-screen flex flex-col ${className}`}>
        {showNavbar && (
          <Navbar
            user={user}
            cartData={serverStorage?.cart}
            bookmarksData={serverStorage?.bookmarks}
          />
        )}

        <main className="flex-1">{children}</main>

        {showFooter && <Footer />}
      </div>
    </ServerHydrationProvider>
  );
}

/**
 * Protected Page Layout
 * For pages that require authentication
 */
interface ProtectedLayoutProps {
  children: ReactNode;
  user: User; // Required for protected pages
  serverStorage?: ServerStorageData;
  title?: string;
  description?: string;
}

export function ProtectedLayout({
  children,
  user,
  serverStorage,
  title,
  description,
}: ProtectedLayoutProps) {
  return (
    <SSRLayout user={user} serverStorage={serverStorage}>
      {title && (
        <div className="bg-background border-b">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {description && <p className="text-muted-foreground mt-2">{description}</p>}
          </div>
        </div>
      )}
      {children}
    </SSRLayout>
  );
}

/**
 * Guest Layout
 * For pages that require no authentication (login, register)
 */
interface GuestLayoutProps {
  children: ReactNode;
  serverStorage?: ServerStorageData;
  showNavbar?: boolean;
  showFooter?: boolean;
}

export function GuestLayout({
  children,
  serverStorage,
  showNavbar = false,
  showFooter = false,
}: GuestLayoutProps) {
  return (
    <SSRLayout
      user={null}
      serverStorage={serverStorage}
      showNavbar={showNavbar}
      showFooter={showFooter}
    >
      {children}
    </SSRLayout>
  );
}

/**
 * Public Layout
 * For pages that work for both authenticated and guest users
 */
interface PublicLayoutProps {
  children: ReactNode;
  user?: User | null;
  serverStorage?: ServerStorageData;
}

export function PublicLayout({ children, user = null, serverStorage }: PublicLayoutProps) {
  return (
    <SSRLayout user={user} serverStorage={serverStorage}>
      {children}
    </SSRLayout>
  );
}
