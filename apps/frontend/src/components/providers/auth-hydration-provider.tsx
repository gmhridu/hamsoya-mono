/**
 * Authentication Hydration Provider
 * Hydrates client-side auth store with server-validated data
 * Eliminates unnecessary API calls by providing server-side authentication state
 */

'use client';

import { useEffect } from 'react';
import { useAuthActions } from '@/store/auth-store';

interface AuthHydrationProviderProps {
  children: React.ReactNode;
  serverAuthState: {
    isAuthenticated: boolean;
    user: {
      id: string;
      email: string;
      name: string;
      role: 'USER' | 'SELLER' | 'ADMIN';
      profile_image_url?: string;
      is_verified: boolean;
      created_at: string;
    } | null;
  };
}

/**
 * Authentication Hydration Provider
 * Provides server-validated authentication state to client components
 * Prevents unnecessary /api/auth/me and other authentication API calls
 */
export function AuthHydrationProvider({
  children,
  serverAuthState
}: AuthHydrationProviderProps) {
  const { setUser, setLoading, clearUser } = useAuthActions();

  useEffect(() => {
    console.log('[AUTH-HYDRATION] Hydrating client state with server data:', serverAuthState);

    if (serverAuthState.isAuthenticated && serverAuthState.user) {
      // Hydrate client state with server-validated user data
      setUser(serverAuthState.user);
      setLoading(false);
    } else {
      // Clear client state if not authenticated
      clearUser();
      setLoading(false);
    }
  }, [serverAuthState, setUser, setLoading, clearUser]);

  return <>{children}</>;
}

/**
 * Lightweight auth hydrator that doesn't wrap children
 * Use this when you only need to hydrate state without provider context
 */
export function AuthStateHydrator({
  serverAuthState
}: Omit<AuthHydrationProviderProps, 'children'>) {
  const { setUser, setLoading, clearUser } = useAuthActions();

  useEffect(() => {
    if (serverAuthState.isAuthenticated && serverAuthState.user) {
      setUser(serverAuthState.user);
      setLoading(false);
    } else {
      clearUser();
      setLoading(false);
    }
  }, [serverAuthState, setUser, setLoading, clearUser]);

  return null;
}
