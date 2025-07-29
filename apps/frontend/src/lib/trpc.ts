import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';

// For now, use any type until we can properly import the backend router type
// In a real monorepo setup, this would be imported from a shared package
type AppRouter = any;

// Create the tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Get the API URL from environment variables
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    // Browser should use relative URL
    return '';
  }

  // SSR should use absolute URL
  if (process.env.NEXT_PUBLIC_TRPC_URL) {
    return process.env.NEXT_PUBLIC_TRPC_URL;
  }

  // Fallback for development
  return 'http://localhost:5000';
}

// tRPC client configuration for React Query
export const trpcClientConfig = {
  transformer: superjson,
  links: [
    loggerLink({
      enabled: opts =>
        process.env.NODE_ENV === 'development' ||
        (opts.direction === 'down' && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      headers() {
        return {
          'Content-Type': 'application/json',
        };
      },
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
};

// Type helpers
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
