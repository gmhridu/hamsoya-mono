/**
 * JWT Debug Utilities
 * Helps diagnose JWT signature verification issues
 */

import { jwtVerify } from 'jose';

/**
 * Debug JWT token structure and verification
 */
export async function debugJWT(token: string) {
  console.log('🔍 JWT Debug Analysis');
  console.log('=' .repeat(50));

  // Basic token structure
  const parts = token.split('.');
  console.log('Token Structure:');
  console.log(`  - Parts: ${parts.length} (should be 3)`);
  console.log(`  - Header length: ${parts[0]?.length}`);
  console.log(`  - Payload length: ${parts[1]?.length}`);
  console.log(`  - Signature length: ${parts[2]?.length}`);

  // Decode header
  try {
    const header = JSON.parse(atob(parts[0]));
    console.log('Header:', header);
  } catch (error) {
    console.error('Failed to decode header:', error);
  }

  // Decode payload (without verification)
  try {
    const payload = JSON.parse(atob(parts[1]));
    console.log('Payload:', {
      ...payload,
      exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiry',
      iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'No issued at',
    });
  } catch (error) {
    console.error('Failed to decode payload:', error);
  }

  // Test verification with different secret formats
  const secrets = [
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_REFRESH_SECRET,
  ].filter(Boolean);

  for (const secretStr of secrets) {
    if (!secretStr) continue;

    console.log(`\nTesting secret: ${secretStr.substring(0, 10)}...`);
    
    // Test with TextEncoder (current approach)
    try {
      const secret = new TextEncoder().encode(secretStr);
      const result = await jwtVerify(token, secret, { algorithms: ['HS256'] });
      console.log('✅ TextEncoder approach - SUCCESS');
      console.log('Verified payload:', result.payload);
      return result.payload;
    } catch (error) {
      console.log('❌ TextEncoder approach - FAILED:', (error as Error).message);
    }

    // Test with direct string (alternative approach)
    try {
      const secret = new TextEncoder().encode(secretStr);
      const result = await jwtVerify(token, secret, { algorithms: ['HS256'] });
      console.log('✅ Direct string approach - SUCCESS');
      return result.payload;
    } catch (error) {
      console.log('❌ Direct string approach - FAILED:', (error as Error).message);
    }
  }

  console.log('🚨 All verification attempts failed');
  return null;
}

/**
 * Test JWT verification with environment secrets
 */
export async function testJWTVerification() {
  console.log('🧪 JWT Verification Test');
  console.log('=' .repeat(50));

  // Check environment variables
  console.log('Environment Check:');
  console.log(`  - JWT_ACCESS_SECRET: ${process.env.JWT_ACCESS_SECRET ? '✅ Present' : '❌ Missing'}`);
  console.log(`  - JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? '✅ Present' : '❌ Missing'}`);
  
  if (process.env.JWT_ACCESS_SECRET) {
    console.log(`  - Access secret length: ${process.env.JWT_ACCESS_SECRET.length}`);
  }
  
  if (process.env.JWT_REFRESH_SECRET) {
    console.log(`  - Refresh secret length: ${process.env.JWT_REFRESH_SECRET.length}`);
  }

  // Test with sample token if available
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const accessToken = cookies.accessToken;
    const refreshToken = cookies.refreshToken;

    if (accessToken) {
      console.log('\n📝 Testing Access Token:');
      await debugJWT(accessToken);
    }

    if (refreshToken) {
      console.log('\n📝 Testing Refresh Token:');
      await debugJWT(refreshToken);
    }

    if (!accessToken && !refreshToken) {
      console.log('\n⚠️  No tokens found in cookies');
    }
  }
}

/**
 * Compare backend and frontend JWT implementations
 */
export function compareJWTImplementations() {
  console.log('🔄 JWT Implementation Comparison');
  console.log('=' .repeat(50));

  console.log('Backend (jsonwebtoken):');
  console.log('  - Library: jsonwebtoken');
  console.log('  - Algorithm: HS256');
  console.log('  - Secret: Direct string');
  console.log('  - Signing: jwt.sign(payload, secret, options)');

  console.log('\nFrontend (jose):');
  console.log('  - Library: jose');
  console.log('  - Algorithm: HS256');
  console.log('  - Secret: TextEncoder.encode(string)');
  console.log('  - Verification: jwtVerify(token, secret, options)');

  console.log('\n🎯 Key Differences:');
  console.log('  - Secret encoding: Backend uses string, Frontend uses TextEncoder');
  console.log('  - Library differences: Different JWT implementations');
  console.log('  - Error handling: Different error types and messages');
}
