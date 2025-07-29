// Simple API client for making requests to the Next.js API routes
const API_BASE_URL = '/api';

// Custom error class for API errors
export class ApiError extends Error {
  public statusCode?: number;
  public errorCode?: string;
  public userFriendly: boolean;

  constructor(
    message: string,
    options?: { statusCode?: number; errorCode?: string; userFriendly?: boolean }
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = options?.statusCode;
    this.errorCode = options?.errorCode;
    this.userFriendly = options?.userFriendly ?? false;
  }
}

// Helper function to get user-friendly error messages
function getUserFriendlyErrorMessage(status: number, errorData: any): string {
  // Priority order for extracting error messages:
  // 1. Specific backend error from details.error (most specific)
  // 2. Main error message from error field
  // 3. Legacy message field
  // 4. Fallback to status code mapping

  // Check for specific backend error in details
  if (errorData.details?.error && typeof errorData.details.error === 'string') {
    return errorData.details.error;
  }

  // Check for main error message
  if (
    errorData.error &&
    typeof errorData.error === 'string' &&
    !errorData.error.includes('HTTP error!')
  ) {
    return errorData.error;
  }

  // Check for legacy message field
  if (
    errorData.message &&
    typeof errorData.message === 'string' &&
    !errorData.message.includes('HTTP error!')
  ) {
    return errorData.message;
  }

  // Map status codes to user-friendly messages as fallback
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'You need to log in to access this feature.';
    case 403:
      return "You don't have permission to perform this action.";
    case 404:
      return 'The requested resource was not found. Please try again later.';
    case 409:
      return 'This action conflicts with existing data. Please refresh and try again.';
    case 422:
      return 'The provided data is invalid. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment before trying again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return 'Something went wrong. Please try again later.';
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'same-origin', // Include cookies for same-origin requests
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const userFriendlyMessage = getUserFriendlyErrorMessage(response.status, errorData);

        // Log the full error details for debugging
        console.error('API Error Details:', {
          status: response.status,
          url,
          errorData,
          userFriendlyMessage,
        });

        throw new ApiError(userFriendlyMessage, {
          statusCode: response.status,
          errorCode: errorData.errorCode || errorData.details?.errorCode,
          userFriendly: true,
        });
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);

      // If it's already an ApiError, re-throw it
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Network error. Please check your internet connection.', {
          errorCode: 'NETWORK_ERROR',
          userFriendly: true,
        });
      }

      // Handle other unexpected errors
      throw new ApiError('An unexpected error occurred. Please try again.', {
        errorCode: 'UNKNOWN_ERROR',
        userFriendly: true,
      });
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Health check
  async healthCheck() {
    return this.get('/health');
  }

  // Products API
  async getProducts(params?: {
    category?: string;
    search?: string;
    featured?: boolean;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: string;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';

    return this.get(endpoint);
  }

  async getProduct(id: string) {
    return this.get(`/products/${id}`);
  }

  async getFeaturedProducts(limit?: number) {
    const params = limit ? `?featured=true&limit=${limit}` : '?featured=true';
    return this.get(`/products${params}`);
  }

  async getProductsByCategory(category: string, limit?: number) {
    const params = limit ? `?category=${category}&limit=${limit}` : `?category=${category}`;
    return this.get(`/products${params}`);
  }

  async searchProducts(query: string, limit?: number) {
    const params = limit
      ? `?search=${encodeURIComponent(query)}&limit=${limit}`
      : `?search=${encodeURIComponent(query)}`;
    return this.get(`/products${params}`);
  }

  // Categories API
  async getCategories() {
    return this.get('/categories');
  }

  async getCategory(slug: string) {
    return this.get(`/categories/${slug}`);
  }

  // Authentication API (placeholder for future implementation)
  async login(email: string, password: string) {
    return this.post('/auth/login', { email, password });
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    role: 'USER' | 'SELLER' | 'ADMIN';
    phone_number?: string;
    profile_image_url?: string;
  }) {
    return this.post('/auth/register', data);
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  async verifyEmail(email: string, otp: string) {
    return this.post('/auth/verify', { email, otp });
  }

  async resendVerification(email: string) {
    return this.post('/auth/resend-verification', { email });
  }

  async getCooldownStatus(email: string) {
    return this.get(`/auth/cooldown-status?email=${encodeURIComponent(email)}`);
  }

  // Backward compatibility method using POST
  async getCooldownStatusPost(email: string) {
    return this.post('/auth/cooldown-status', { email });
  }

  async forgotPassword(email: string) {
    return this.post('/auth/forgot-password', { email });
  }

  async resetPassword(email: string, password: string) {
    return this.post('/auth/reset-password', { email, password });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export { ApiClient };
