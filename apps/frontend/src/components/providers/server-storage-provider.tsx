/**
 * Server Storage Provider - Zero Flicker Implementation
 * Initializes stores with server-side data without client-side useEffect hooks
 * Eliminates white screen flicker during page reloads
 */

'use client';

import { ServerStorageData } from '@/lib/server-storage-cache';
import { initializeStores } from '@/lib/store-hydration';
import { ReactNode, useMemo } from 'react';

interface ServerStorageProviderProps {
  children: ReactNode;
  serverStorage: ServerStorageData;
}

/**
 * Server Storage Provider
 * Initializes client stores with server-side data immediately
 * No useEffect hooks - prevents re-renders and flicker
 */
export function ServerStorageProvider({ children, serverStorage }: ServerStorageProviderProps) {
  // Initialize stores with server data using useMemo to ensure it only runs once
  // This happens during the initial render, not in useEffect
  const isInitialized = useMemo(() => {
    return initializeStores(serverStorage);
  }, [serverStorage]);

  // Render children immediately - no loading states or conditional rendering
  return <>{children}</>;
}

/**
 * Hook to initialize server storage data
 * Use this in components that need to ensure stores are initialized
 */
export function useServerStorageInit(serverStorage: ServerStorageData) {
  return useMemo(() => {
    const isInitialized = initializeStores(serverStorage);

    return {
      cartInitialized: isInitialized,
      bookmarksInitialized: isInitialized,
      isHydrated: isInitialized,
    };
  }, [serverStorage]);
}
