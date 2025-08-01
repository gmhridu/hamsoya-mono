/**
 * Enhanced Token Management System
 * Provides comprehensive token cleanup and management
 */

'use client';

import { deleteCookie, getAccessToken } from './cookies';

/**
 * Force immediate cleanup of expired access tokens
 * This is more aggressive than the periodic cleanup
 */
export function forceTokenCleanup(): void {
  if (typeof window === 'undefined') return;

  const token = getAccessToken();
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);

    // If token is expired or expires within 30 seconds, remove it immediately
    if (payload.exp && payload.exp <= now + 30) {
      deleteCookie('accessToken');
      
      // Also clear from any potential storage locations
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('accessToken');
      }
    }
  } catch (error) {
    // If token is malformed, remove it
    deleteCookie('accessToken');
  }
}

/**
 * Set up aggressive token monitoring
 * This monitors token expiration more frequently than the standard cleanup
 */
export function setupAggressiveTokenMonitoring(): () => void {
  if (typeof window === 'undefined') return () => {};

  // Check every 15 seconds for expired tokens
  const monitoringInterval = setInterval(forceTokenCleanup, 15 * 1000);

  // Monitor on various events
  const events = ['focus', 'click', 'keydown', 'mousemove'];
  const eventHandler = () => forceTokenCleanup();

  events.forEach(event => {
    window.addEventListener(event, eventHandler, { passive: true });
  });

  // Return cleanup function
  return () => {
    clearInterval(monitoringInterval);
    events.forEach(event => {
      window.removeEventListener(event, eventHandler);
    });
  };
}

/**
 * Check if current access token is expired or about to expire
 */
export function isTokenExpiredOrExpiring(bufferSeconds: number = 60): boolean {
  const token = getAccessToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return !payload.exp || payload.exp <= now + bufferSeconds;
  } catch {
    return true;
  }
}

/**
 * Get token expiration time in milliseconds
 */
export function getTokenExpirationTime(): number | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}
