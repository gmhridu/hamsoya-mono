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

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; SameSite=Strict${secureAttr}`;

  // Also try without SameSite for broader compatibility
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}${secureAttr}`;
}

export function getAccessToken(): string | null {
  return getCookie('accessToken');
}

export function clearAuthCookies(): void {
  deleteCookie('accessToken');
  // Note: refreshToken is httpOnly, so it can't be deleted from client-side
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
