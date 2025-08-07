import { advancedTokenRefreshService } from '@/lib/advanced-token-refresh';
import { enhancedTokenManager } from '@/lib/enhanced-token-manager';
import { useAuthActions } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

export function useTokenRefresh() {
  const { logout } = useAuthActions();
  const router = useRouter();
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = performTokenRefresh();
    const result = await refreshPromiseRef.current;
    refreshPromiseRef.current = null;
    return result;
  }, []);

  const performTokenRefresh = async (): Promise<boolean> => {
    try {
      // Use the advanced token refresh service
      const result = await advancedTokenRefreshService.refreshTokens();

      if (result.success) {
        return true;
      } else {
        // The advanced service handles cleanup and user notification
        // We just need to handle navigation if needed
        if (result.shouldLogout) {
          setTimeout(() => router.push('/login'), 100);
        }
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleRefreshFailure();
      return false;
    }
  };

  const handleRefreshFailure = useCallback(() => {
    // Use enhanced token manager for comprehensive cleanup
    enhancedTokenManager.forceCleanup('Token refresh failed');

    // Navigate to login page
    router.push('/login');
  }, [router]);

  return {
    refreshTokens,
    handleRefreshFailure,
  };
}
