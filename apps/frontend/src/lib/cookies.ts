export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }

  return null;
}

export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof document === 'undefined') {
    return;
  }

  // Set cookie with past expiration date to delete it
  // Include all possible attributes to ensure deletion works in all environments
  const isSecure = window.location.protocol === 'https:' || process.env.NODE_ENV === 'production';
  const secureAttr = isSecure ? '; Secure' : '';
  const pastDate = 'Thu, 01 Jan 1970 00:00:00 UTC';

  // Multiple deletion attempts for immediate effect
  document.cookie = `${name}=; expires=${pastDate}; max-age=0; path=${path}; SameSite=Strict${secureAttr}`;
  document.cookie = `${name}=; expires=${pastDate}; max-age=0; path=${path}${secureAttr}`;
  document.cookie = `${name}=; expires=${pastDate}; max-age=0; path=${path}; SameSite=Lax${secureAttr}`;

  // Also try root path
  if (path !== '/') {
    document.cookie = `${name}=; expires=${pastDate}; max-age=0; path=/; SameSite=Strict${secureAttr}`;
    document.cookie = `${name}=; expires=${pastDate}; max-age=0; path=/${secureAttr}`;
  }
}

export function getAccessToken(): string | null {
  return getCookie('accessToken');
}

export function getRefreshToken(): string | null {
  // Note: refreshToken is httpOnly, so it can't be accessed from client-side
  // This function exists for API compatibility but will always return null
  // The actual refresh token is handled server-side
  return null;
}

export function clearAuthCookies(): void {
  deleteCookie('accessToken');
  // Note: refreshToken is httpOnly, so it can't be deleted from client-side
  // It will be cleared via API call to backend
}

/**
 * Clear all authentication and session cookies
 * Enhanced for comprehensive security cleanup with immediate effect
 */
export function clearAllAuthCookies(): void {
  // Clear access token (client-accessible) with multiple attempts
  deleteCookie('accessToken');
  deleteCookie('access_token');

  // Try to clear refresh token (even though it's httpOnly, attempt anyway)
  deleteCookie('refreshToken');
  deleteCookie('refresh_token');

  // Clear session cookies
  deleteCookie('session_id');
  deleteCookie('sessionId');

  // Clear any other auth-related cookies
  deleteCookie('user_role');
  deleteCookie('userRole');

  // Clear cart and bookmark count cookies (they'll be regenerated)
  deleteCookie('cart_count');
  deleteCookie('bookmark_count');

  // Clear any potential JWT cookies
  deleteCookie('jwt');
  deleteCookie('token');
  deleteCookie('auth_token');

  // Force immediate cleanup by setting empty values
  if (typeof document !== 'undefined') {
    // Additional immediate cleanup
    const cookiesToClear = [
      'accessToken', 'access_token', 'refreshToken', 'refresh_token',
      'session_id', 'sessionId', 'user_role', 'userRole',
      'cart_count', 'bookmark_count', 'jwt', 'token', 'auth_token'
    ];

    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; max-age=0`;
    });
  }
}

/**
 * Check if access token is expired and clean it up if needed
 * This helps ensure expired tokens don't remain visible in browser
 */
export function cleanupExpiredTokens(): void {
  if (typeof document === 'undefined') return;

  const accessToken = getAccessToken();
  if (accessToken) {
    try {
      // Decode JWT payload to check expiration
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);

      // If token is expired, remove it from cookies
      if (payload.exp && payload.exp < now) {
        deleteCookie('accessToken');
      }
    } catch (error) {
      // If token is malformed, remove it
      deleteCookie('accessToken');
    }
  }
}

/**
 * Set up automatic cleanup of expired tokens
 * This runs frequently to ensure expired tokens are removed immediately
 */
export function setupTokenCleanup(): (() => void) | void {
  if (typeof window === 'undefined') return;

  // Clean up immediately
  cleanupExpiredTokens();

  // Set up frequent cleanup every 30 seconds for better responsiveness
  const cleanupInterval = setInterval(cleanupExpiredTokens, 30 * 1000);

  // Clean up on page visibility change
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      cleanupExpiredTokens();
    }
  };

  // Clean up on page focus (when user returns to tab)
  const handleFocus = () => {
    cleanupExpiredTokens();
  };

  // Clean up before page unload
  const handleBeforeUnload = () => {
    cleanupExpiredTokens();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleFocus);
  window.addEventListener('beforeunload', handleBeforeUnload);

  // Return cleanup function
  return () => {
    clearInterval(cleanupInterval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}
