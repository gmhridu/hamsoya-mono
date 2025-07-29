'use client';

import { queryClient } from '@/lib/query-client';
import { trpc, trpcClientConfig } from '@/lib/trpc';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface TRPCProviderProps {
  children: React.ReactNode;
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  // Create stable client instances
  const [queryClientInstance] = useState(() => queryClient);
  const [trpcClient] = useState(() => trpc.createClient(trpcClientConfig));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClientInstance}>
      <QueryClientProvider client={queryClientInstance}>
        {children}
        {/* Show React Query DevTools in development */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

// Keep the old name for backward compatibility
export const QueryProvider = TRPCProvider;
