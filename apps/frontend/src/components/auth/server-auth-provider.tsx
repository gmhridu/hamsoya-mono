/**
 * Server Authentication Provider
 * Provides server-side authentication state to eliminate unnecessary client-side API calls
 * Hydrates client state with server-validated user data
 */

'use client';

import { useEffect } from 'react';
import { useAuthActions } from '@/store/auth-store';

interface ServerAuthProviderProps {
  children: React.ReactNode;
  initialUser?: {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'SELLER' | 'ADMIN';
    profile_image_url?: string;
    is_verified: boolean;
    created_at: string;
  } | null;
  isAuthenticated: boolean;
}

/**
 * Server Authentication Provider
 * Hydrates client-side auth store with server-validated data
 * Prevents unnecessary API calls after server-side authentication
 */
export function ServerAuthProvider({
  children,
  initialUser,
  isAuthenticated
}: ServerAuthProviderProps) {
  const { setUser, setLoading, clearUser } = useAuthActions();

  useEffect(() => {
    // Hydrate client state with server-validated data
    if (isAuthenticated && initialUser) {
      console.log('[SERVER-AUTH-PROVIDER] Hydrating client state with server data:', initialUser);
      setUser(initialUser);
      setLoading(false);
    } else if (!isAuthenticated) {
      console.log('[SERVER-AUTH-PROVIDER] No authentication, clearing client state');
      clearUser();
      setLoading(false);
    }
  }, [initialUser, isAuthenticated, setUser, setLoading, clearUser]);

  return <>{children}</>;
}

/**
 * Server Authentication Hydrator
 * Lightweight component that only hydrates auth state without rendering children
 */
export function ServerAuthHydrator({
  initialUser,
  isAuthenticated
}: Omit<ServerAuthProviderProps, 'children'>) {
  const { setUser, setLoading, clearUser } = useAuthActions();

  useEffect(() => {
    if (isAuthenticated && initialUser) {
      setUser(initialUser);
      setLoading(false);
    } else if (!isAuthenticated) {
      clearUser();
      setLoading(false);
    }
  }, [initialUser, isAuthenticated, setUser, setLoading, clearUser]);

  return null;
}
