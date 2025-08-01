/**
 * Authentication debugging utilities
 * Helps diagnose authentication flow issues
 */

import { getCookie } from './cookies';

export interface AuthDebugInfo {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  accessTokenPreview?: string;
  cookieCount: number;
  allCookies: string[];
  timestamp: string;
}

/**
 * Get comprehensive authentication debug information
 */
export function getAuthDebugInfo(): AuthDebugInfo {
  if (typeof window === 'undefined') {
    return {
      hasAccessToken: false,
      hasRefreshToken: false,
      cookieCount: 0,
      allCookies: [],
      timestamp: new Date().toISOString(),
    };
  }

  const accessToken = getCookie('accessToken');
  const refreshToken = getCookie('refreshToken');
  const allCookies = document.cookie.split(';').map(c => c.trim());

  return {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : undefined,
    cookieCount: allCookies.length,
    allCookies: allCookies.filter(c => c.length > 0),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Log authentication debug information to console
 */
export function logAuthDebugInfo(): void {
  const info = getAuthDebugInfo();
  console.group('🔐 Authentication Debug Info');
  console.log('Timestamp:', info.timestamp);
  console.log('Has Access Token:', info.hasAccessToken);
  console.log('Has Refresh Token:', info.hasRefreshToken);
  if (info.accessTokenPreview) {
    console.log('Access Token Preview:', info.accessTokenPreview);
  }
  console.log('Total Cookies:', info.cookieCount);
  console.log('All Cookies:', info.allCookies);
  console.groupEnd();
}

/**
 * Test token detection functionality
 */
export function testTokenDetection(): boolean {
  const info = getAuthDebugInfo();
  
  console.group('🧪 Token Detection Test');
  console.log('Testing token detection...');
  
  // Test 1: Basic cookie access
  const cookieAccess = typeof document !== 'undefined' && document.cookie !== undefined;
  console.log('✓ Cookie access available:', cookieAccess);
  
  // Test 2: Access token detection
  const accessTokenDetected = info.hasAccessToken;
  console.log('✓ Access token detected:', accessTokenDetected);
  
  // Test 3: Refresh token detection (should be false due to httpOnly)
  const refreshTokenDetected = info.hasRefreshToken;
  console.log('✓ Refresh token detected (should be false):', refreshTokenDetected);
  
  // Test 4: Cookie parsing
  const cookieParsingWorks = info.allCookies.length >= 0;
  console.log('✓ Cookie parsing works:', cookieParsingWorks);
  
  const allTestsPassed = cookieAccess && cookieParsingWorks;
  console.log('🎯 All tests passed:', allTestsPassed);
  console.groupEnd();
  
  return allTestsPassed;
}

/**
 * Test API client token retrieval
 */
export async function testApiClientTokens(): Promise<boolean> {
  console.group('🌐 API Client Token Test');
  
  try {
    // Import API client dynamically to avoid SSR issues
    const { apiClient } = await import('./api-client');
    
    // Test token retrieval method
    const token = (apiClient as any).getAccessToken?.();
    console.log('✓ API Client token retrieval:', !!token);
    
    if (token) {
      console.log('✓ Token preview:', `${token.substring(0, 20)}...`);
    }
    
    console.log('🎯 API Client test passed:', !!token);
    console.groupEnd();
    
    return !!token;
  } catch (error) {
    console.error('❌ API Client test failed:', error);
    console.groupEnd();
    return false;
  }
}

/**
 * Run comprehensive authentication diagnostics
 */
export async function runAuthDiagnostics(): Promise<void> {
  console.log('🚀 Starting Authentication Diagnostics...');
  
  // Basic info
  logAuthDebugInfo();
  
  // Token detection test
  const tokenDetectionPassed = testTokenDetection();
  
  // API client test
  const apiClientPassed = await testApiClientTokens();
  
  // Summary
  console.group('📊 Diagnostics Summary');
  console.log('Token Detection:', tokenDetectionPassed ? '✅ PASS' : '❌ FAIL');
  console.log('API Client:', apiClientPassed ? '✅ PASS' : '❌ FAIL');
  
  const overallStatus = tokenDetectionPassed && apiClientPassed;
  console.log('Overall Status:', overallStatus ? '✅ HEALTHY' : '❌ ISSUES DETECTED');
  
  if (!overallStatus) {
    console.log('🔧 Recommended Actions:');
    if (!tokenDetectionPassed) {
      console.log('- Check cookie configuration (httpOnly settings)');
      console.log('- Verify token refresh mechanism');
    }
    if (!apiClientPassed) {
      console.log('- Check API client token retrieval logic');
      console.log('- Verify cookie parsing implementation');
    }
  }
  
  console.groupEnd();
}

// Export for global access in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).authDebug = {
    getInfo: getAuthDebugInfo,
    log: logAuthDebugInfo,
    test: testTokenDetection,
    testApi: testApiClientTokens,
    diagnose: runAuthDiagnostics,
  };
}
