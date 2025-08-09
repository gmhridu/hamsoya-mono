/**
 * Centralized API URL Configuration
 * Provides consistent URL construction for frontend and backend API calls
 * Eliminates double /api/api/ patterns and ensures proper URL building
 */

// Environment variables with proper defaults
const FRONTEND_API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/api';
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * API URL Configuration
 */
export const API_CONFIG = {
  // Frontend API URLs (for calling Next.js API routes)
  frontend: {
    base: FRONTEND_API_URL,
    auth: {
      login: `${FRONTEND_API_URL}/auth/login`,
      register: `${FRONTEND_API_URL}/auth/register`,
      logout: `${FRONTEND_API_URL}/auth/logout`,
      me: `${FRONTEND_API_URL}/auth/me`,
      refreshToken: `${FRONTEND_API_URL}/auth/refresh-token`,
      verify: `${FRONTEND_API_URL}/auth/verify`,
      resendVerification: `${FRONTEND_API_URL}/auth/resend-verification`,
      cooldownStatus: `${FRONTEND_API_URL}/auth/cooldown-status`,
      forgotPassword: `${FRONTEND_API_URL}/auth/forgot-password`,
      resetPassword: `${FRONTEND_API_URL}/auth/reset-password`,
      verifyForgotPassword: `${FRONTEND_API_URL}/auth/verify-forgot-password-enhanced`,
      checkPasswordResetVerification: `${FRONTEND_API_URL}/auth/check-password-reset-verification`,
      // Google OAuth endpoints
      googleOAuth: `${FRONTEND_API_URL}/auth/google`,
      googleOAuthCallback: `${FRONTEND_API_URL}/auth/google/callback`,
    },
    cart: `${FRONTEND_API_URL}/cart`,
    cartCount: `${FRONTEND_API_URL}/cart/count`,
    bookmarks: `${FRONTEND_API_URL}/bookmarks`,
    bookmarksCount: `${FRONTEND_API_URL}/bookmarks/count`,
    products: `${FRONTEND_API_URL}/products`,
    health: `${FRONTEND_API_URL}/health`,
    imagekit: `${FRONTEND_API_URL}/imagekit/auth`,
  },

  // Backend API URLs (for direct backend calls)
  backend: {
    base: BACKEND_API_URL,
    auth: {
      login: `${BACKEND_API_URL}/auth/login`,
      register: `${BACKEND_API_URL}/auth/register`,
      logout: `${BACKEND_API_URL}/auth/logout`,
      me: `${BACKEND_API_URL}/auth/me`,
      refreshToken: `${BACKEND_API_URL}/auth/refresh-token`,
      verify: `${BACKEND_API_URL}/auth/verify`,
      resendVerification: `${BACKEND_API_URL}/auth/resend-verification`,
      cooldownStatus: `${BACKEND_API_URL}/auth/cooldown-status`,
      forgotPassword: `${BACKEND_API_URL}/auth/forgot-password`,
      resetPassword: `${BACKEND_API_URL}/auth/reset-password`,
      verifyForgotPassword: `${BACKEND_API_URL}/auth/verify-forgot-password-enhanced`,
      checkPasswordResetVerification: `${BACKEND_API_URL}/auth/check-password-reset-verification`,
      sendOtp: `${BACKEND_API_URL}/auth/send-otp`,
      verifyOtpEnhanced: `${BACKEND_API_URL}/auth/verify-otp-enhanced`,
    },
    trpc: `${BACKEND_API_URL.replace('/api', '')}/trpc`,
    products: `${BACKEND_API_URL}/products`,
    health: `${BACKEND_API_URL}/health`,
  },
} as const;

/**
 * URL Construction Utilities
 */
export const urlBuilder = {
  /**
   * Build frontend API URL
   */
  frontend: (endpoint: string): string => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${FRONTEND_API_URL}/${cleanEndpoint}`;
  },

  /**
   * Build backend API URL
   */
  backend: (endpoint: string): string => {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${BACKEND_API_URL}/${cleanEndpoint}`;
  },

  /**
   * Build tRPC URL with query parameters
   */
  trpc: (procedure: string, input?: any): string => {
    const baseUrl = `${API_CONFIG.backend.trpc}/${procedure}`;
    if (input) {
      const encodedInput = encodeURIComponent(JSON.stringify(input));
      return `${baseUrl}?input=${encodedInput}`;
    }
    return baseUrl;
  },

  /**
   * Build product URL
   */
  product: (id: string): string => {
    return `${BACKEND_API_URL}/products/${id}`;
  },

  /**
   * Validate URL to prevent double /api/api/ patterns
   */
  validate: (url: string): string => {
    if (url.includes('/api/api/')) {
      console.warn('Double /api/api/ pattern detected in URL:', url);
      return url.replace('/api/api/', '/api/');
    }
    return url;
  },
};

/**
 * Environment-specific configurations
 */
export const ENV_CONFIG = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  frontendUrl: FRONTEND_API_URL,
  backendUrl: BACKEND_API_URL,
};

/**
 * Legacy support - gradually migrate from these
 * @deprecated Use API_CONFIG instead
 */
export const LEGACY_URLS = {
  API_BASE_URL: '/api',
  BACKEND_URL: BACKEND_API_URL,
  FRONTEND_URL: FRONTEND_API_URL,
};

/**
 * Type definitions for API endpoints
 */
export type FrontendEndpoint = keyof typeof API_CONFIG.frontend;
export type BackendEndpoint = keyof typeof API_CONFIG.backend;
export type AuthEndpoint = keyof typeof API_CONFIG.frontend.auth | keyof typeof API_CONFIG.backend.auth;

/**
 * Helper function to get the appropriate API URL based on context
 */
export function getApiUrl(type: 'frontend' | 'backend' = 'frontend'): string {
  return type === 'frontend' ? FRONTEND_API_URL : BACKEND_API_URL;
}

/**
 * Helper function to build auth URLs
 */
export function buildAuthUrl(endpoint: string, type: 'frontend' | 'backend' = 'frontend'): string {
  const baseUrl = getApiUrl(type);
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/auth/${cleanEndpoint}`;
}

/**
 * Debugging utility to log URL construction
 */
export function debugUrl(url: string, context: string): string {
  if (ENV_CONFIG.isDevelopment) {
    console.log(`[API-CONFIG] ${context}:`, url);
    if (url.includes('/api/api/')) {
      console.error(`[API-CONFIG] Double /api/api/ detected in ${context}:`, url);
    }
  }
  return url;
}
