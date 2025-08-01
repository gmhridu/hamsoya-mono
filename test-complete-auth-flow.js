#!/usr/bin/env node

/**
 * Complete Authentication Flow Test
 * Tests the entire authentication flow including automatic token refresh
 */

const http = require('http');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

// Test user credentials (created by create-test-user.js)
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123',
};

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(data);
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: jsonData,
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: data,
            });
          }
        });
      }
    );

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

function extractTokensFromCookies(setCookieHeaders) {
  let accessToken = '';
  let refreshToken = '';

  if (Array.isArray(setCookieHeaders)) {
    setCookieHeaders.forEach(cookie => {
      if (cookie.includes('accessToken=')) {
        accessToken = cookie.match(/accessToken=([^;]+)/)?.[1] || '';
      }
      if (cookie.includes('refreshToken=')) {
        refreshToken = cookie.match(/refreshToken=([^;]+)/)?.[1] || '';
      }
    });
  } else if (setCookieHeaders) {
    if (setCookieHeaders.includes('accessToken=')) {
      accessToken = setCookieHeaders.match(/accessToken=([^;]+)/)?.[1] || '';
    }
    if (setCookieHeaders.includes('refreshToken=')) {
      refreshToken = setCookieHeaders.match(/refreshToken=([^;]+)/)?.[1] || '';
    }
  }

  return { accessToken, refreshToken };
}

async function testCompleteAuthFlow() {
  console.log('🔐 Testing Complete Authentication Flow...\n');

  try {
    // Step 1: Login to get tokens
    console.log('1️⃣ Logging in with verified user...');
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

    console.log('🔑 Access token received:', !!accessToken);
    console.log('🔑 Refresh token received:', !!refreshToken);

    if (!accessToken || !refreshToken) {
      console.log('❌ Tokens not received properly');
      return;
    }

    // Step 2: Test backend refresh token endpoint
    console.log('\n2️⃣ Testing backend refresh token endpoint...');
    const backendRefreshResponse = await makeRequest(`${BACKEND_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        Cookie: `refreshToken=${refreshToken}; accessToken=${accessToken}`,
      },
    });

    if (backendRefreshResponse.status === 200) {
      console.log('✅ Backend token refresh successful');

      // Extract new tokens
      const newSetCookieHeaders = backendRefreshResponse.headers['set-cookie'] || [];
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        extractTokensFromCookies(newSetCookieHeaders);

      console.log('🔄 New access token received:', !!newAccessToken);
      console.log('🔄 New refresh token received:', !!newRefreshToken);

      // Update tokens for next tests
      if (newAccessToken) accessToken = newAccessToken;
      if (newRefreshToken) refreshToken = newRefreshToken;
    } else {
      console.log('❌ Backend token refresh failed:', backendRefreshResponse.data);
    }

    // Step 3: Test frontend refresh token endpoint
    console.log('\n3️⃣ Testing frontend refresh token endpoint...');
    const frontendRefreshResponse = await makeRequest(`${FRONTEND_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        Cookie: `refreshToken=${refreshToken}; accessToken=${accessToken}`,
      },
    });

    if (frontendRefreshResponse.status === 200) {
      console.log('✅ Frontend token refresh successful');
    } else {
      console.log('❌ Frontend token refresh failed:', frontendRefreshResponse.data);
    }

    // Step 4: Test authenticated API call
    console.log('\n4️⃣ Testing authenticated API call...');
    const meResponse = await makeRequest(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        Cookie: `refreshToken=${refreshToken}; accessToken=${accessToken}`,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (meResponse.status === 200) {
      console.log('✅ Authenticated API call successful');
      console.log('👤 User data:', meResponse.data?.data?.user || meResponse.data?.user);
    } else {
      console.log('❌ Authenticated API call failed:', meResponse.data);
    }

    // Step 5: Test server-side authentication with tokens
    console.log('\n5️⃣ Testing server-side authentication...');
    const homePageWithTokensResponse = await makeRequest(`${FRONTEND_URL}/`, {
      method: 'GET',
      headers: {
        Cookie: `refreshToken=${refreshToken}; accessToken=${accessToken}`,
      },
    });

    console.log('📊 Home page with tokens:', {
      status: homePageWithTokensResponse.status,
      hasContent: homePageWithTokensResponse.data?.length > 0,
    });

    // Step 6: Test refresh-only scenario (simulate expired access token)
    console.log('\n6️⃣ Testing refresh-only scenario (simulating expired access token)...');
    const refreshOnlyResponse = await makeRequest(`${FRONTEND_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        Cookie: `refreshToken=${refreshToken}`, // Only refresh token, no access token
      },
    });

    if (refreshOnlyResponse.status === 200) {
      console.log('✅ Refresh-only scenario successful - this is the key test!');
      console.log('🎯 This proves the automatic refresh mechanism works');
    } else {
      console.log('❌ Refresh-only scenario failed:', refreshOnlyResponse.data);
      console.log('🚨 This indicates the automatic refresh mechanism is not working properly');
    }

    console.log('\n🎉 Complete authentication flow test finished!');

    // Summary
    console.log('\n📋 Test Results Summary:');
    console.log('- Login: ✅');
    console.log('- Backend refresh: ' + (backendRefreshResponse.status === 200 ? '✅' : '❌'));
    console.log('- Frontend refresh: ' + (frontendRefreshResponse.status === 200 ? '✅' : '❌'));
    console.log('- Authenticated API: ' + (meResponse.status === 200 ? '✅' : '❌'));
    console.log('- Refresh-only (key test): ' + (refreshOnlyResponse.status === 200 ? '✅' : '❌'));

    if (refreshOnlyResponse.status === 200) {
      console.log('\n🎯 SUCCESS: The automatic token refresh mechanism is working correctly!');
      console.log('   Users with valid refresh tokens will be automatically authenticated.');
    } else {
      console.log('\n🚨 ISSUE: The automatic token refresh mechanism needs attention.');
      console.log('   Users may appear as unauthenticated even with valid refresh tokens.');
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testCompleteAuthFlow();
