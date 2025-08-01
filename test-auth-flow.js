#!/usr/bin/env node

/**
 * Authentication Flow Test Script
 * Tests the automatic token refresh mechanism
 */

const https = require('https');
const http = require('http');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'TestPassword123', // Must have uppercase, lowercase, and number
  name: 'Test User',
  role: 'USER',
};

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const req = client.request(
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

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...\n');

  try {
    // Step 1: Register a test user
    console.log('1️⃣ Registering test user...');
    const registerResponse = await makeRequest(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      body: TEST_USER,
    });

    if (registerResponse.status === 201 || registerResponse.status === 409) {
      console.log('✅ User registration successful or user already exists');
    } else {
      console.log('❌ User registration failed:', registerResponse.data);
      return;
    }

    // Step 2: Login to get tokens
    console.log('\n2️⃣ Logging in to get tokens...');
    const loginResponse = await makeRequest(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: TEST_USER.email,
        password: TEST_USER.password,
      },
    });

    if (loginResponse.status !== 200) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }

    console.log('✅ Login successful');

    // Extract cookies from Set-Cookie headers
    const setCookieHeaders = loginResponse.headers['set-cookie'] || [];
    let accessToken = '';
    let refreshToken = '';

    setCookieHeaders.forEach(cookie => {
      if (cookie.includes('accessToken=')) {
        accessToken = cookie.match(/accessToken=([^;]+)/)?.[1] || '';
      }
      if (cookie.includes('refreshToken=')) {
        refreshToken = cookie.match(/refreshToken=([^;]+)/)?.[1] || '';
      }
    });

    console.log('🔑 Access token received:', !!accessToken);
    console.log('🔑 Refresh token received:', !!refreshToken);

    if (!accessToken || !refreshToken) {
      console.log('❌ Tokens not received properly');
      return;
    }

    // Step 3: Test refresh token endpoint
    console.log('\n3️⃣ Testing refresh token endpoint...');
    const refreshResponse = await makeRequest(`${BACKEND_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        Cookie: `refreshToken=${refreshToken}; accessToken=${accessToken}`,
      },
    });

    if (refreshResponse.status === 200) {
      console.log('✅ Token refresh successful');
      console.log('📊 Response data:', refreshResponse.data);
    } else {
      console.log('❌ Token refresh failed:', refreshResponse.data);
    }

    // Step 4: Test frontend refresh endpoint
    console.log('\n4️⃣ Testing frontend refresh endpoint...');
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

    console.log('\n🎉 Authentication flow test completed!');
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testAuthFlow();
