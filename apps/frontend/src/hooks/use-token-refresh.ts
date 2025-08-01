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
      const response = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (response.ok) {
        return true;
      }

      handleRefreshFailure();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      handleRefreshFailure();
      return false;
    }
  };

  const handleRefreshFailure = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  return {
    refreshTokens,
    handleRefreshFailure,
  };
}
