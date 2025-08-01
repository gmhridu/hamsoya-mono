/**
 * Token Security Test Suite
 * Verifies that expired access tokens are properly removed from browser cookies
 */

import { deleteCookie, getAccessToken, cleanupExpiredTokens } from '@/lib/cookies';
import { forceTokenCleanup, isTokenExpiredOrExpiring } from '@/lib/token-manager';

// Mock document.cookie for testing
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

// Mock window.location for secure cookie testing
Object.defineProperty(window, 'location', {
  value: {
    protocol: 'https:',
  },
  writable: true,
});

describe('Token Security Tests', () => {
  beforeEach(() => {
    // Clear all cookies before each test
    document.cookie = '';
  });

  describe('Cookie Deletion Security', () => {
    it('should delete cookies with proper security attributes', () => {
      // Set a test cookie
      document.cookie = 'accessToken=test-token; path=/; SameSite=Strict; Secure';
      
      // Delete the cookie
      deleteCookie('accessToken');
      
      // Verify cookie is deleted
      expect(getAccessToken()).toBeNull();
    });

    it('should handle both secure and non-secure environments', () => {
      // Test in non-secure environment
      Object.defineProperty(window, 'location', {
        value: { protocol: 'http:' },
        writable: true,
      });

      document.cookie = 'accessToken=test-token; path=/';
      deleteCookie('accessToken');
      expect(getAccessToken()).toBeNull();

      // Test in secure environment
      Object.defineProperty(window, 'location', {
        value: { protocol: 'https:' },
        writable: true,
      });

      document.cookie = 'accessToken=test-token; path=/; Secure';
      deleteCookie('accessToken');
      expect(getAccessToken()).toBeNull();
    });
  });

  describe('Expired Token Detection', () => {
    it('should detect expired tokens', () => {
      // Create an expired token (expired 1 hour ago)
      const expiredTime = Math.floor(Date.now() / 1000) - 3600;
      const expiredPayload = { exp: expiredTime };
      const expiredToken = `header.${btoa(JSON.stringify(expiredPayload))}.signature`;
      
      document.cookie = `accessToken=${expiredToken}; path=/`;
      
      expect(isTokenExpiredOrExpiring()).toBe(true);
    });

    it('should detect tokens expiring soon', () => {
      // Create a token expiring in 30 seconds
      const soonExpiredTime = Math.floor(Date.now() / 1000) + 30;
      const soonExpiredPayload = { exp: soonExpiredTime };
      const soonExpiredToken = `header.${btoa(JSON.stringify(soonExpiredPayload))}.signature`;
      
      document.cookie = `accessToken=${soonExpiredToken}; path=/`;
      
      expect(isTokenExpiredOrExpiring(60)).toBe(true); // 60 second buffer
    });

    it('should not flag valid tokens as expired', () => {
      // Create a token expiring in 10 minutes
      const validTime = Math.floor(Date.now() / 1000) + 600;
      const validPayload = { exp: validTime };
      const validToken = `header.${btoa(JSON.stringify(validPayload))}.signature`;
      
      document.cookie = `accessToken=${validToken}; path=/`;
      
      expect(isTokenExpiredOrExpiring()).toBe(false);
    });
  });

  describe('Automatic Token Cleanup', () => {
    it('should remove expired tokens during cleanup', () => {
      // Create an expired token
      const expiredTime = Math.floor(Date.now() / 1000) - 3600;
      const expiredPayload = { exp: expiredTime };
      const expiredToken = `header.${btoa(JSON.stringify(expiredPayload))}.signature`;
      
      document.cookie = `accessToken=${expiredToken}; path=/`;
      
      // Verify token exists before cleanup
      expect(getAccessToken()).toBe(expiredToken);
      
      // Run cleanup
      cleanupExpiredTokens();
      
      // Verify token is removed after cleanup
      expect(getAccessToken()).toBeNull();
    });

    it('should preserve valid tokens during cleanup', () => {
      // Create a valid token
      const validTime = Math.floor(Date.now() / 1000) + 600;
      const validPayload = { exp: validTime };
      const validToken = `header.${btoa(JSON.stringify(validPayload))}.signature`;
      
      document.cookie = `accessToken=${validToken}; path=/`;
      
      // Run cleanup
      cleanupExpiredTokens();
      
      // Verify token is preserved
      expect(getAccessToken()).toBe(validToken);
    });

    it('should remove malformed tokens', () => {
      // Set a malformed token
      document.cookie = 'accessToken=malformed-token; path=/';
      
      // Run cleanup
      cleanupExpiredTokens();
      
      // Verify malformed token is removed
      expect(getAccessToken()).toBeNull();
    });
  });

  describe('Force Token Cleanup', () => {
    it('should aggressively remove tokens expiring within 30 seconds', () => {
      // Create a token expiring in 15 seconds
      const soonExpiredTime = Math.floor(Date.now() / 1000) + 15;
      const soonExpiredPayload = { exp: soonExpiredTime };
      const soonExpiredToken = `header.${btoa(JSON.stringify(soonExpiredPayload))}.signature`;
      
      document.cookie = `accessToken=${soonExpiredToken}; path=/`;
      
      // Run force cleanup
      forceTokenCleanup();
      
      // Verify token is removed
      expect(getAccessToken()).toBeNull();
    });
  });
});

/**
 * Manual Security Test Instructions
 * 
 * To manually verify token cleanup in browser:
 * 
 * 1. Open browser DevTools (F12)
 * 2. Go to Application > Cookies
 * 3. Login to the application
 * 4. Observe the accessToken cookie
 * 5. Wait 5 minutes (or modify token expiry for faster testing)
 * 6. Verify that expired accessToken is automatically removed
 * 7. Confirm that only valid tokens remain visible
 * 
 * Expected Results:
 * - Expired tokens should disappear from cookies within 30 seconds
 * - New tokens should appear seamlessly after refresh
 * - No expired tokens should ever be visible to users
 */
