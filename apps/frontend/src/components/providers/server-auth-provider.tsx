/**
 * Server Auth Provider
 * Provides centralized user authentication data from server-side rendering
 * Eliminates duplicate API calls and ensures consistent auth state
 * Now supports client-side updates for logout and login actions
 */

'use client';

import type { User } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface ServerAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: false; // Always false since data comes from server
  // Client-side update methods
  updateUser: (user: User | null) => void;
  clearAuth: () => void;
}

const ServerAuthContext = createContext<ServerAuthContextType | undefined>(undefined);

interface ServerAuthProviderProps {
  children: ReactNode;
  user: User | null;
  isAuthenticated: boolean;
}

/**
 * Server Auth Provider Component
 * Provides user data fetched server-side to all child components
 * Now supports client-side updates for seamless logout/login
 */
export function ServerAuthProvider({ children, user, isAuthenticated }: ServerAuthProviderProps) {
  // Use state to allow client-side updates while preserving server-side initial data
  const [currentUser, setCurrentUser] = useState<User | null>(user);
  const [currentIsAuthenticated, setCurrentIsAuthenticated] = useState<boolean>(isAuthenticated);

  // Update state when server props change (for navigation between pages)
  useEffect(() => {
    setCurrentUser(user);
    setCurrentIsAuthenticated(isAuthenticated);
  }, [user, isAuthenticated]);

  // Listen for logout events from client-side hooks
  useEffect(() => {
    const handleLogout = () => {
      setCurrentUser(null);
      setCurrentIsAuthenticated(false);
    };

    const handleLogin = (event: CustomEvent) => {
      const userData = event.detail;
      if (userData) {
        setCurrentUser(userData);
        setCurrentIsAuthenticated(true);
      }
    };

    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:login', handleLogin as EventListener);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('auth:login', handleLogin as EventListener);
    };
  }, []);

  // Client-side update methods
  const updateUser = (newUser: User | null) => {
    setCurrentUser(newUser);
    setCurrentIsAuthenticated(!!newUser);
  };

  const clearAuth = () => {
    setCurrentUser(null);
    setCurrentIsAuthenticated(false);
  };

  const value: ServerAuthContextType = {
    user: currentUser,
    isAuthenticated: currentIsAuthenticated,
    isLoading: false, // Never loading since data comes from server
    updateUser,
    clearAuth,
  };

  return <ServerAuthContext.Provider value={value}>{children}</ServerAuthContext.Provider>;
}

/**
 * Hook to access server-side authentication data
 * Provides instant access to user data without loading states
 */
export function useServerAuth(): ServerAuthContextType {
  const context = useContext(ServerAuthContext);

  if (context === undefined) {
    throw new Error('useServerAuth must be used within a ServerAuthProvider');
  }

  return context;
}

/**
 * Hook for components that need user data
 * Returns user data with type safety
 */
export function useUser(): {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: false;
} {
  const { user, isAuthenticated } = useServerAuth();

  return {
    user,
    isAuthenticated,
    isLoading: false,
  };
}

/**
 * Hook for protected components that require authentication
 * Throws error if user is not authenticated (should be handled by middleware)
 */
export function useAuthenticatedUser(): {
  user: User;
  isAuthenticated: true;
  isLoading: false;
} {
  const { user, isAuthenticated } = useServerAuth();

  if (!isAuthenticated || !user) {
    throw new Error(
      'useAuthenticatedUser called but user is not authenticated. This should be handled by middleware.'
    );
  }

  return {
    user,
    isAuthenticated: true,
    isLoading: false,
  };
}

/**
 * Higher-order component for pages that need user data
 */
export function withServerAuth<P extends object>(
  Component: React.ComponentType<P & { user: User | null; isAuthenticated: boolean }>
) {
  return function ServerAuthComponent(props: P) {
    const { user, isAuthenticated } = useServerAuth();

    return <Component {...props} user={user} isAuthenticated={isAuthenticated} />;
  };
}

export type { ServerAuthContextType, User };
