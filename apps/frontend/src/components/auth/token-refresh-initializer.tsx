/**
 * Token Refresh Initializer
 * Client component that initializes the unified token refresh service
 * Ensures automatic token refresh works seamlessly
 * ZERO FLICKER: Uses direct execution instead of useEffect
 */

'use client';

import { initializeTokenRefresh } from '@/lib/unified-token-refresh';

// Global flag to prevent multiple initializations
declare global {
  var __tokenRefreshInitialized: boolean | undefined;
}

export function TokenRefreshInitializer() {
  // Execute initialization immediately during render (no useEffect)
  // This prevents re-renders and flicker
  if (typeof window !== 'undefined') {
    // Use a module-level flag to ensure this only runs once
    if (!globalThis.__tokenRefreshInitialized) {
      globalThis.__tokenRefreshInitialized = true;

      // Initialize the unified token refresh service
      initializeTokenRefresh();
    }
  }

  // This component doesn't render anything
  return null;
}
