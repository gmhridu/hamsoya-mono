import { headers } from 'next/headers';
import { Footer } from './footer';
import { Navbar } from './navbar';
import { ConditionalLayoutClient } from './conditional-layout-client';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export async function ConditionalLayout({ children }: ConditionalLayoutProps) {
  // Try to get the pathname from headers first (server-side)
  const headersList = await headers();
  const serverPathname = headersList.get('x-pathname') || '';

  // Check if current route is an admin route based on server pathname
  const isAdminRoute = serverPathname.startsWith('/admin');

  if (isAdminRoute) {
    // Admin layout: full-screen without navbar and footer
    return (
      <div className="min-h-screen">
        <main className="h-screen">{children}</main>
      </div>
    );
  }

  // For non-admin routes, use client-side fallback to ensure reliability
  return (
    <ConditionalLayoutClient serverPathname={serverPathname}>
      <div className="relative flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ConditionalLayoutClient>
  );
}
