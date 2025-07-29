import { apiClient } from '@/lib/api-client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

// Intelligent polling intervals based on cooldown remaining
const getPollingInterval = (cooldownRemaining: number): number | false => {
  if (cooldownRemaining <= 0) {
    return false; // Stop polling when no cooldown
  }

  if (cooldownRemaining <= 10) {
    return 1000; // Poll every second for last 10 seconds
  }

  if (cooldownRemaining <= 30) {
    return 2000; // Poll every 2 seconds for last 30 seconds
  }

  if (cooldownRemaining <= 60) {
    return 5000; // Poll every 5 seconds for last minute
  }

  return 10000; // Poll every 10 seconds for longer cooldowns
};

// Exponential backoff for error scenarios
const getErrorBackoffInterval = (errorCount: number): number => {
  const baseInterval = 5000; // 5 seconds base
  const maxInterval = 60000; // 1 minute max
  const backoffInterval = Math.min(baseInterval * Math.pow(2, errorCount), maxInterval);
  return backoffInterval;
};

interface CooldownData {
  cooldownRemaining: number;
  canResend: boolean;
}

interface UseCooldownOptions {
  enabled?: boolean;
  onCooldownComplete?: () => void;
  onError?: (error: Error) => void;
}

export function useOptimizedCooldown(email: string | null, options: UseCooldownOptions = {}) {
  const { enabled = true, onCooldownComplete, onError } = options;
  const queryClient = useQueryClient();
  const errorCountRef = useRef(0);
  const lastCooldownRef = useRef<number | null>(null);
  const isActiveRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isActiveRef.current = true;
    return () => {
      isActiveRef.current = false;
    };
  }, []);

  const query = useQuery({
    queryKey: ['cooldown-status', email],
    queryFn: async (): Promise<CooldownData> => {
      if (!email) throw new Error('Email is required');

      try {
        const response = await apiClient.getCooldownStatus(email);
        errorCountRef.current = 0; // Reset error count on success

        // Extract cooldown data from response
        const data = response.data || response;
        return {
          cooldownRemaining: data.cooldownRemaining || 0,
          canResend: data.canResend ?? true,
        };
      } catch (error) {
        errorCountRef.current += 1;
        throw error;
      }
    },
    enabled: enabled && !!email && isActiveRef.current,
    staleTime: 3000, // Consider data fresh for 3 seconds (reduced API calls)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: true, // Refetch when component mounts
    refetchInterval: (data, query) => {
      // Don't poll if component is unmounted or disabled
      if (!isActiveRef.current || !enabled) {
        return false;
      }

      // Handle error scenarios with exponential backoff
      if (query.state.error) {
        return getErrorBackoffInterval(errorCountRef.current);
      }

      // Use intelligent polling based on cooldown remaining
      if (data) {
        const interval = getPollingInterval(data.cooldownRemaining);
        // Add some jitter to prevent thundering herd
        if (interval && typeof interval === 'number') {
          return interval + Math.random() * 500; // Add 0-500ms jitter
        }
        return interval;
      }

      // Default fallback with jitter
      return 5000 + Math.random() * 1000; // 5-6 seconds
    },
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Refetch on network reconnect
    retry: (failureCount, error: any) => {
      // Don't retry on client errors (4xx)
      if (error?.statusCode >= 400 && error?.statusCode < 500) {
        return false;
      }
      // Retry up to 3 times for server errors
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Handle cooldown completion
  useEffect(() => {
    if (query.data) {
      const currentCooldown = query.data.cooldownRemaining;
      const previousCooldown = lastCooldownRef.current;

      // Trigger callback when cooldown reaches zero
      if (previousCooldown !== null && previousCooldown > 0 && currentCooldown === 0) {
        onCooldownComplete?.();
      }

      lastCooldownRef.current = currentCooldown;
    }
  }, [query.data, onCooldownComplete]);

  // Handle errors
  useEffect(() => {
    if (query.error && onError) {
      onError(query.error as Error);
    }
  }, [query.error, onError]);

  // Manual refresh function
  const refresh = useCallback(() => {
    if (isActiveRef.current && email) {
      queryClient.invalidateQueries({ queryKey: ['cooldown-status', email] });
    }
  }, [email, queryClient]);

  // Stop polling function
  const stopPolling = useCallback(() => {
    isActiveRef.current = false;
    queryClient.cancelQueries({ queryKey: ['cooldown-status', email] });
  }, [email, queryClient]);

  // Resume polling function
  const resumePolling = useCallback(() => {
    isActiveRef.current = true;
    refresh();
  }, [refresh]);

  return {
    // Data
    data: query.data,
    cooldownRemaining: query.data?.cooldownRemaining || 0,
    canResend: query.data?.canResend ?? true,

    // Status
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,

    // Control functions
    refresh,
    stopPolling,
    resumePolling,

    // Internal state for debugging
    errorCount: errorCountRef.current,
    isActive: isActiveRef.current,
  };
}
