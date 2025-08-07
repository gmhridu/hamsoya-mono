/**
 * Secure Cookie Manager
 * Manages secure, httpOnly cookies for sensitive data like bookmarks and cart counts
 * Prevents data exposure while maintaining functionality
 */

'use client';

interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  maxAge?: number;
  path?: string;
}

class SecureCookieManager {
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Set a secure cookie via API route
   */
  async setSecureCookie(name: string, value: any, options: CookieOptions = {}): Promise<boolean> {
    try {
      const response = await fetch('/api/cookies/set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          value: typeof value === 'string' ? value : JSON.stringify(value),
          options: {
            httpOnly: true, // Always httpOnly for security
            secure: this.isProduction,
            sameSite: 'Strict',
            path: '/',
            ...options,
          },
        }),
      });

      return response.ok;
    } catch (error) {
      console.warn('Failed to set secure cookie:', error);
      return false;
    }
  }

  /**
   * Get a secure cookie value via API route
   */
  async getSecureCookie(name: string): Promise<any> {
    try {
      const response = await fetch(`/api/cookies/get?name=${encodeURIComponent(name)}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        return data.value;
      }
      return null;
    } catch (error) {
      console.warn('Failed to get secure cookie:', error);
      return null;
    }
  }

  /**
   * Delete a secure cookie via API route
   */
  async deleteSecureCookie(name: string): Promise<boolean> {
    try {
      const response = await fetch('/api/cookies/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });

      return response.ok;
    } catch (error) {
      console.warn('Failed to delete secure cookie:', error);
      return false;
    }
  }

  /**
   * Migrate existing localStorage data to secure cookies
   */
  async migrateToSecureCookies(): Promise<void> {
    if (typeof window === 'undefined') return;

    const itemsToMigrate = [
      'hamsoya-bookmarks-v2',
      'hamsoya-cart-v2',
    ];

    for (const item of itemsToMigrate) {
      try {
        const existingData = localStorage.getItem(item);
        if (existingData) {
          // Set as secure cookie
          await this.setSecureCookie(item, existingData);
          
          // Remove from localStorage
          localStorage.removeItem(item);
        }
      } catch (error) {
        console.warn(`Failed to migrate ${item}:`, error);
      }
    }
  }

  /**
   * Clean up unnecessary cookies
   */
  async cleanupUnnecessaryCookies(): Promise<void> {
    const unnecessaryCookies = [
      'old_session_id',
      'temp_data',
      'analytics_temp',
      // Add any other unnecessary cookies here
    ];

    for (const cookieName of unnecessaryCookies) {
      await this.deleteSecureCookie(cookieName);
    }
  }

  /**
   * Set bookmark count securely
   */
  async setBookmarkCount(count: number): Promise<boolean> {
    return this.setSecureCookie('bookmark_count', count.toString(), {
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  }

  /**
   * Get bookmark count securely
   */
  async getBookmarkCount(): Promise<number> {
    const count = await this.getSecureCookie('bookmark_count');
    return count ? parseInt(count, 10) : 0;
  }

  /**
   * Set cart count securely
   */
  async setCartCount(count: number): Promise<boolean> {
    return this.setSecureCookie('cart_count', count.toString(), {
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  }

  /**
   * Get cart count securely
   */
  async getCartCount(): Promise<number> {
    const count = await this.getSecureCookie('cart_count');
    return count ? parseInt(count, 10) : 0;
  }

  /**
   * Set bookmarks data securely
   */
  async setBookmarksData(data: any): Promise<boolean> {
    return this.setSecureCookie('hamsoya-bookmarks-v2', data, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  }

  /**
   * Get bookmarks data securely
   */
  async getBookmarksData(): Promise<any> {
    const data = await this.getSecureCookie('hamsoya-bookmarks-v2');
    return data ? JSON.parse(data) : null;
  }

  /**
   * Set cart data securely
   */
  async setCartData(data: any): Promise<boolean> {
    return this.setSecureCookie('hamsoya-cart-v2', data, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  }

  /**
   * Get cart data securely
   */
  async getCartData(): Promise<any> {
    const data = await this.getSecureCookie('hamsoya-cart-v2');
    return data ? JSON.parse(data) : null;
  }
}

// Create singleton instance
export const secureCookieManager = new SecureCookieManager();

// Export class for testing
export { SecureCookieManager };
