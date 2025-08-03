import { TokenCleanup } from '@/components/auth/token-cleanup';
import { TokenRefreshInitializer } from '@/components/auth/token-refresh-initializer';
import { ConditionalLayout } from '@/components/layout/conditional-layout';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { AuthSync } from '@/components/providers/auth-sync';
import { EnhancedServerStorageProvider } from '@/components/providers/enhanced-server-storage-provider';
import { ServerAuthProvider } from '@/components/providers/server-auth-provider';
import { StorageSync } from '@/components/providers/storage-sync';
import { TRPCProvider } from '@/components/providers/trpc-provider';
import { ChunkErrorBoundary } from '@/components/ui/chunk-error-boundary';
import { PageTransition } from '@/components/ui/smooth-transition';
import { Toaster } from '@/components/ui/sonner';
import { SEO_DEFAULTS } from '@/lib/constants';
import { getServerStorageData } from '@/lib/enhanced-server-storage-cache';
import { getCurrentUserInstant } from '@/lib/server-auth-cache';
import { StorageSyncInitializer } from '@/lib/unified-storage-sync';
import type { Metadata } from 'next';
import { Playfair_Display, PT_Sans } from 'next/font/google';
import './globals.css';

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const ptSans = PT_Sans({
  variable: '--font-pt-sans',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: SEO_DEFAULTS.title,
  description: SEO_DEFAULTS.description,
  keywords: SEO_DEFAULTS.keywords,

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      {
        rel: 'icon',
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'icon',
        url: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },

  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hamsoya',
    startupImage: [
      {
        url: '/apple-touch-icon.png',
        media:
          '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  openGraph: {
    title: SEO_DEFAULTS.title,
    description: SEO_DEFAULTS.description,
    images: [SEO_DEFAULTS.ogImage],
    type: 'website',
    locale: 'en_US',
    siteName: 'Hamsoya',
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_DEFAULTS.title,
    description: SEO_DEFAULTS.description,
    images: [SEO_DEFAULTS.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isAuthenticated } = await getCurrentUserInstant();

  const serverStorage = await getServerStorageData();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfairDisplay.variable} ${ptSans.variable} antialiased`}>
        <ChunkErrorBoundary>
          <TRPCProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ServerAuthProvider user={user} isAuthenticated={isAuthenticated}>
                <EnhancedServerStorageProvider
                  cart={serverStorage.cart}
                  bookmarks={serverStorage.bookmarks}
                >
                  {/* Automatic token cleanup and refresh */}
                  <TokenCleanup />
                  <TokenRefreshInitializer />
                  {/* Authentication state synchronization */}
                  <AuthSync />
                  {/* Storage state synchronization */}
                  <StorageSync />
                  {/* Storage synchronization for data persistence */}
                  <StorageSyncInitializer />
                  <PageTransition>
                    <ConditionalLayout>
                      {children}
                    </ConditionalLayout>
                  </PageTransition>
                </EnhancedServerStorageProvider>
              </ServerAuthProvider>
              <Toaster />
            </ThemeProvider>
          </TRPCProvider>
        </ChunkErrorBoundary>
      </body>
    </html>
  );
}
