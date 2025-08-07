/**
 * Authentication type definitions for the Next.js application
 * Provides comprehensive TypeScript support for auth-related data structures
 */

export interface User {
  id: string;
  name?: string; // Made optional to match server reality
  email: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  phone_number?: string;
  profile_image_url?: string;
  is_verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export interface AuthStore extends AuthState, AuthActions {}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'SELLER';
  phone_number?: string;
  profile_image_url?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthError {
  message: string;
  statusCode?: number;
  errorCode?: string;
  userFriendly?: boolean;
}

/**
 * Auth gate component props for controlling access to routes
 */
export interface AuthGateProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireGuest?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * Auth hook return type for consistent API across components
 */
export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * Login hook return type for optimistic updates
 */
export interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Query keys for TanStack Query cache management
 */
export const AUTH_QUERY_KEYS = {
  me: ['auth', 'me'] as const,
  profile: ['auth', 'profile'] as const,
} as const;

/**
 * Storage keys for persistence
 */
export const AUTH_STORAGE_KEYS = {
  user: 'hamsoya-auth-user',
  state: 'hamsoya-auth-state',
} as const;

/**
 * Auth configuration constants
 * Optimized for persistent caching until actual user data changes
 */
export const AUTH_CONFIG = {
  staleTime: Infinity, // Never consider data stale - only invalidate on actual changes
  gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep in background cache much longer
  retryAttempts: 1,
  redirectDelay: 0, // Instant redirects
  serverCacheDuration: 5 * 60 * 1000, // 5 minutes for server-side cache
  // Fallback stale time for non-critical queries
  fallbackStaleTime: 15 * 60 * 1000, // 15 minutes
} as const;
