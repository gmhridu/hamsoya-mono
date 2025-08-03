import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Temporarily ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Turbopack configuration (replaces webpack when using --turbopack)
  turbopack: {
    resolveAlias: {
      // Fix superjson import resolution for Turbopack
      superjson: 'superjson',
    },
  },
  // Webpack configuration (fallback for non-Turbopack builds)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }

    // Fix superjson import resolution for webpack
    config.resolve.alias = {
      ...config.resolve.alias,
      superjson: require.resolve('superjson'),
    };

    return config;
  },
  // Reduce development server noise and improve performance
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // Optimize development experience
  experimental: {
    // Reduce static file requests in development
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Prevent source file exposure in development
  productionBrowserSourceMaps: false,
  // Fix chunk loading errors and asset path issues
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : '',
  // Ensure proper asset path resolution
  trailingSlash: false,
  // Fix chunk loading errors
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  // Fix double slash issues in development
  basePath: '',
};

export default nextConfig;
