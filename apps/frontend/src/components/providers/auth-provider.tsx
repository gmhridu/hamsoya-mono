'use client';

import { useAuthInitialization } from '@/hooks/use-auth';
import { authCacheManager } from '@/lib/auth-cache-manager';
import { useAuthStore } from '@/store/auth-store';
import type { User } from '@/types/auth';
import { ReactNode, useEffect, useState } from 'react';

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
  initialIsAuthenticated?: boolean;
}

export function AuthProvider({ children, initialUser, initialIsAuthenticated }: AuthProviderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { isInitialized, isLoading } = useAuthInitialization();
  const { isAuthenticated, setUser } = useAuthStore();

  // Hydrate the store with server-side data on mount
  useEffect(() => {
    setIsMounted(true);

    // Debug logging for development (minimal)
    if (process.env.NODE_ENV === 'development') {
      console.log('AuthProvider hydration:', {
        authenticated: initialIsAuthenticated,
        hasUser: !!initialUser,
      });
    }

    // Always hydrate the store with server-side data to prevent flickering
    if (initialIsAuthenticated && initialUser) {
      // User is authenticated - set user data immediately
      setUser(initialUser);

      // Use cache manager for smart cache hydration
      if (typeof window !== 'undefined') {
        authCacheManager.prefetchUserData(initialUser);
      }
    } else {
      // User is not authenticated or no user data - clear user data
      setUser(null);

      // Clear cache using cache manager
      if (typeof window !== 'undefined') {
        authCacheManager.clearUserCache();
      }
    }
  }, [initialUser, initialIsAuthenticated, setUser]);

  // Token refresh is now handled by TokenRefreshInitializer in layout
  // No need to manage it here to avoid conflicts

  // During SSR and initial hydration, always render children to prevent mismatch
  if (!isMounted) {
    return <>{children}</>;
  }

  // Only show loading after hydration is complete and we're actually loading
  if (!isInitialized && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
