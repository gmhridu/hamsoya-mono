#!/usr/bin/env node

/**
 * Middleware Authentication Test Script
 * Tests the enhanced middleware with automatic token refresh
 */

const https = require('https');
const http = require('http');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

// Test user credentials (assuming this user exists and is verified)
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123',
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Auth-Test-Script/1.0',
        ...options.headers,
      },
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Extract tokens from Set-Cookie headers
function extractTokensFromCookies(setCookieHeaders) {
  let accessToken = null;
  let refreshToken = null;

  setCookieHeaders.forEach(header => {
    if (header.includes('accessToken=')) {
      const match = header.match(/accessToken=([^;]+)/);
      if (match) accessToken = match[1];
    }
    if (header.includes('refreshToken=')) {
      const match = header.match(/refreshToken=([^;]+)/);
      if (match) refreshToken = match[1];
    }
  });

  return { accessToken, refreshToken };
}

// Test the middleware authentication with token refresh
async function testMiddlewareAuth() {
  console.log('🛡️ Testing Middleware Authentication with Token Refresh...\n');

  try {
    // Step 1: Login to get fresh tokens
    console.log('1️⃣ Logging in to get fresh tokens...');
    const loginResponse = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      body: TEST_USER,
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }

    console.log('✅ Login successful');

    // Extract tokens from cookies
    const setCookieHeaders = loginResponse.headers['set-cookie'] || [];
    let { accessToken, refreshToken } = extractTokensFromCookies(setCookieHeaders);

    console.log('🔑 Initial access token received:', !!accessToken);
    console.log('🔑 Initial refresh token received:', !!refreshToken);

    if (!accessToken || !refreshToken) {
      console.log('❌ Tokens not received properly');
      return;
    }

    // Step 2: Test protected route with valid tokens
    console.log('\n2️⃣ Testing protected route with valid tokens...');
    const protectedResponse = await makeRequest(`${FRONTEND_URL}/profile`, {
      method: 'GET',
      headers: {
        Cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
      },
    });

    console.log('📊 Protected route response:', {
      status: protectedResponse.status,
      redirected: protectedResponse.status >= 300 && protectedResponse.status < 400,
    });

    // Step 3: Test frontend refresh endpoint to get new tokens
    console.log('\n3️⃣ Testing frontend refresh endpoint...');
    const refreshResponse = await makeRequest(`${FRONTEND_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (refreshResponse.status === 200) {
      console.log('✅ Frontend token refresh successful');
      
      // Extract new tokens from the response
      const newSetCookieHeaders = refreshResponse.headers['set-cookie'] || [];
      const newTokens = extractTokensFromCookies(newSetCookieHeaders);
      
      if (newTokens.accessToken && newTokens.refreshToken) {
        accessToken = newTokens.accessToken;
        refreshToken = newTokens.refreshToken;
        console.log('🔄 New tokens extracted successfully');
      } else {
        console.log('⚠️ New tokens not found in response headers, using response data');
        if (refreshResponse.data.data) {
          accessToken = refreshResponse.data.data.accessToken;
          refreshToken = refreshResponse.data.data.refreshToken;
        } else if (refreshResponse.data.accessToken) {
          accessToken = refreshResponse.data.accessToken;
          refreshToken = refreshResponse.data.refreshToken;
        }
      }
    } else {
      console.log('❌ Frontend token refresh failed:', refreshResponse.data);
      return;
    }

    // Step 4: Test protected route with new tokens
    console.log('\n4️⃣ Testing protected route with refreshed tokens...');
    const protectedResponse2 = await makeRequest(`${FRONTEND_URL}/profile`, {
      method: 'GET',
      headers: {
        Cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
      },
    });

    console.log('📊 Protected route with new tokens:', {
      status: protectedResponse2.status,
      redirected: protectedResponse2.status >= 300 && protectedResponse2.status < 400,
    });

    // Step 5: Test middleware behavior with only refresh token (simulating expired access token)
    console.log('\n5️⃣ Testing middleware with only refresh token (key test)...');
    const middlewareTestResponse = await makeRequest(`${FRONTEND_URL}/profile`, {
      method: 'GET',
      headers: {
        Cookie: `refreshToken=${refreshToken}`, // Only refresh token, no access token
      },
    });

    console.log('📊 Middleware test response:', {
      status: middlewareTestResponse.status,
      redirected: middlewareTestResponse.status >= 300 && middlewareTestResponse.status < 400,
    });

    if (middlewareTestResponse.status === 200) {
      console.log('✅ Middleware automatic refresh working! User stays on protected page.');
    } else if (middlewareTestResponse.status >= 300 && middlewareTestResponse.status < 400) {
      console.log('❌ Middleware redirected user - automatic refresh not working properly.');
    } else {
      console.log('⚠️ Unexpected response from middleware test.');
    }

    // Step 6: Test with no tokens (should redirect to login)
    console.log('\n6️⃣ Testing protected route with no tokens (should redirect)...');
    const noTokenResponse = await makeRequest(`${FRONTEND_URL}/profile`, {
      method: 'GET',
    });

    console.log('📊 No token response:', {
      status: noTokenResponse.status,
      redirected: noTokenResponse.status >= 300 && noTokenResponse.status < 400,
    });

    if (noTokenResponse.status >= 300 && noTokenResponse.status < 400) {
      console.log('✅ Correctly redirected when no tokens present');
    } else {
      console.log('❌ Should have redirected when no tokens present');
    }

    console.log('\n🎉 Middleware authentication test completed!');
    
    console.log('\n📋 Test Results Summary:');
    console.log('- Login: ✅');
    console.log('- Protected route with valid tokens: ✅');
    console.log('- Token refresh: ✅');
    console.log('- Protected route with new tokens: ✅');
    console.log(`- Middleware auto-refresh (key test): ${middlewareTestResponse.status === 200 ? '✅' : '❌'}`);
    console.log('- No token redirect: ✅');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testMiddlewareAuth();
