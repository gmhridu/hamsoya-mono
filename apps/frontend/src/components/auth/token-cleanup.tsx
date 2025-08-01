'use client';

import { setupTokenCleanup } from '@/lib/cookies';
import { setupAggressiveTokenMonitoring } from '@/lib/token-manager';

// Global flag to prevent multiple initializations
declare global {
  var __tokenCleanupInitialized: boolean | undefined;
  var __tokenCleanupFunctions:
    | {
        standard?: () => void;
        aggressive?: () => void;
      }
    | undefined;
}

/**
 * Component that sets up automatic cleanup of expired tokens
 * This ensures expired access tokens are removed from browser cookies
 * ZERO FLICKER: Uses direct execution instead of useEffect
 */
export function TokenCleanup() {
  // Execute cleanup setup immediately during render (no useEffect)
  // This prevents re-renders and flicker
  if (typeof window !== 'undefined') {
    // Use a module-level flag to ensure this only runs once
    if (!globalThis.__tokenCleanupInitialized) {
      globalThis.__tokenCleanupInitialized = true;

      // Set up standard token cleanup
      const standardCleanup = setupTokenCleanup();

      // Set up aggressive token monitoring for immediate cleanup
      const aggressiveCleanup = setupAggressiveTokenMonitoring();

      // Store cleanup functions globally for potential cleanup
      globalThis.__tokenCleanupFunctions = {
        standard: typeof standardCleanup === 'function' ? standardCleanup : undefined,
        aggressive: typeof aggressiveCleanup === 'function' ? aggressiveCleanup : undefined,
      };
    }
  }

  // This component doesn't render anything
  return null;
}
