'use client';

import { enhancedTokenManager } from '@/lib/enhanced-token-manager';
import { useEffect } from 'react';

/**
 * Enhanced Token Initializer Component
 * Initializes the comprehensive token management system
 * This ensures automatic cleanup of invalid tokens and handles server restart scenarios
 */
export function EnhancedTokenInitializer() {
  useEffect(() => {
    // Initialize the enhanced token manager
    enhancedTokenManager.initialize();

    // Cleanup on unmount
    return () => {
      enhancedTokenManager.destroy();
    };
  }, []);

  // This component doesn't render anything
  return null;
}
