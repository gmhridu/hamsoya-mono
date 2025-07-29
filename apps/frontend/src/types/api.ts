// Shared types for API communication
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  phone_number?: string;
  profile_image_url?: string;
  is_verified: boolean;
  created_at: string;
}

export interface LoginResponse {
  user: User;
  message: string;
}

export interface RegisterResponse {
  message: string;
}

export interface VerifyOTPResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// API Router type - this should match the backend AppRouter
export interface AppRouter {
  health: {
    check: {
      query: () => {
        status: string;
        timestamp: string;
        service: string;
      };
    };
  };
  auth: {
    register: {
      mutation: (input: {
        name: string;
        email: string;
        password: string;
        phone_number?: string;
      }) => {
        message: string;
        user: User;
      };
    };
    login: {
      mutation: (input: { email: string; password: string }) => {
        accessToken: string;
        refreshToken: string;
        user: User;
      };
    };
    verify: {
      mutation: (input: { email: string; otp: string }) => {
        message: string;
      };
    };
    resendVerification: {
      mutation: (input: { email: string }) => {
        message: string;
      };
    };
    forgotPassword: {
      mutation: (input: { email: string }) => {
        message: string;
      };
    };
    verifyForgotPassword: {
      mutation: (input: { email: string; otp: string }) => {
        message: string;
      };
    };
    resetPassword: {
      mutation: (input: { email: string; password: string }) => {
        message: string;
      };
    };
    refreshToken: {
      mutation: (input: { refreshToken: string }) => {
        accessToken: string;
        refreshToken: string;
      };
    };
    me: {
      query: () => User;
    };
    logout: {
      mutation: () => {
        message: string;
      };
    };
  };
  user: {
    profile: {
      query: () => User;
    };
    updateProfile: {
      mutation: (input: { name?: string; phone_number?: string }) => User;
    };
    stats: {
      query: () => {
        totalUsers: number;
        verifiedUsers: number;
        unverifiedUsers: number;
      };
    };
  };
  products: {
    list: {
      query: (input?: {
        category?: string;
        search?: string;
        featured?: boolean;
        inStock?: boolean;
        sortBy?: 'name' | 'price' | 'newest' | 'rating';
        sortOrder?: 'asc' | 'desc';
        limit?: number;
        offset?: number;
      }) => any[];
    };
    byId: {
      query: (input: { id: string }) => any;
    };
    featured: {
      query: (input?: { limit?: number }) => any[];
    };
    byCategory: {
      query: (input: { categorySlug: string; limit?: number }) => any[];
    };
    search: {
      query: (input: { query: string; limit?: number }) => any[];
    };
    reviews: {
      query: (input: { productId: string }) => any[];
    };
  };
  categories: {
    list: {
      query: () => any[];
    };
    bySlug: {
      query: (input: { slug: string }) => any;
    };
  };
}
