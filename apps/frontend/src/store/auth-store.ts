import { STORAGE_KEYS } from '@/lib/constants';
import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Enhanced User interface for backend integration
interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  phone_number?: string;
  profile_image_url?: string;
  is_verified: boolean;
  created_at: string;
}

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: AuthUser) => void;
  logout: () => void;
  clearError: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: user =>
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),

      setLoading: isLoading => set({ isLoading }),

      setError: error => set({ error, isLoading: false }),

      login: user =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }),

      clearError: () => set({ error: null }),

      updateProfile: updates => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },
    }),
    {
      name: STORAGE_KEYS.user,
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for better performance
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);

// Auth actions - using individual selectors to prevent infinite re-renders
export const useAuthActions = () => {
  const setUser = useAuthStore(state => state.setUser);
  const setLoading = useAuthStore(state => state.setLoading);
  const setError = useAuthStore(state => state.setError);
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);
  const clearError = useAuthStore(state => state.clearError);
  const updateProfile = useAuthStore(state => state.updateProfile);

  return useMemo(
    () => ({
      setUser,
      setLoading,
      setError,
      login,
      logout,
      clearError,
      updateProfile,
    }),
    [setUser, setLoading, setError, login, logout, clearError, updateProfile]
  );
};

// Helper hooks
export const useIsAdmin = () => {
  const user = useUser();
  return user?.role === 'ADMIN';
};

export const useIsSeller = () => {
  const user = useUser();
  return user?.role === 'SELLER' || user?.role === 'ADMIN';
};

export const useIsVerified = () => {
  const user = useUser();
  return user?.is_verified ?? false;
};
