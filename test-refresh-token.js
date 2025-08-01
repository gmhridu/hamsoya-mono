#!/usr/bin/env node

/**
 * Refresh Token Test Script
 * Tests the automatic token refresh mechanism by simulating the scenario
 * where a user has a valid refresh token but no access token
 */

const http = require('http');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testRefreshTokenMechanism() {
  console.log('🔄 Testing Refresh Token Mechanism...\n');
  
  try {
    // Test 1: Check if backend refresh endpoint works
    console.log('1️⃣ Testing backend refresh endpoint without tokens...');
    const backendRefreshResponse = await makeRequest(`${BACKEND_URL}/api/auth/refresh-token`, {
      method: 'POST'
    });
    
    console.log('📊 Backend refresh response (no tokens):', {
      status: backendRefreshResponse.status,
      message: backendRefreshResponse.data?.error || backendRefreshResponse.data?.message
    });
    
    // Test 2: Check if frontend refresh endpoint works
    console.log('\n2️⃣ Testing frontend refresh endpoint without tokens...');
    const frontendRefreshResponse = await makeRequest(`${FRONTEND_URL}/api/auth/refresh-token`, {
      method: 'POST'
    });
    
    console.log('📊 Frontend refresh response (no tokens):', {
      status: frontendRefreshResponse.status,
      message: frontendRefreshResponse.data?.error || frontendRefreshResponse.data?.message
    });
    
    // Test 3: Test with invalid refresh token
    console.log('\n3️⃣ Testing with invalid refresh token...');
    const invalidTokenResponse = await makeRequest(`${BACKEND_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Cookie': 'refreshToken=invalid-token-123'
      }
    });
    
    console.log('📊 Invalid token response:', {
      status: invalidTokenResponse.status,
      message: invalidTokenResponse.data?.error || invalidTokenResponse.data?.message
    });
    
    // Test 4: Check server-side auth with no tokens
    console.log('\n4️⃣ Testing server-side authentication state...');
    const homePageResponse = await makeRequest(`${FRONTEND_URL}/`, {
      method: 'GET'
    });
    
    console.log('📊 Home page response:', {
      status: homePageResponse.status,
      hasContent: homePageResponse.data?.length > 0
    });
    
    console.log('\n✅ Refresh token mechanism tests completed!');
    console.log('\n📋 Summary:');
    console.log('- Backend refresh endpoint: ' + (backendRefreshResponse.status === 401 ? '✅ Correctly rejects without token' : '❌ Unexpected response'));
    console.log('- Frontend refresh endpoint: ' + (frontendRefreshResponse.status === 401 ? '✅ Correctly rejects without token' : '❌ Unexpected response'));
    console.log('- Invalid token handling: ' + (invalidTokenResponse.status === 401 ? '✅ Correctly rejects invalid token' : '❌ Unexpected response'));
    console.log('- Home page loads: ' + (homePageResponse.status === 200 ? '✅ Accessible without auth' : '❌ Unexpected response'));
    
    console.log('\n🔍 Next Steps:');
    console.log('1. Create a verified user manually in the database');
    console.log('2. Login to get valid tokens');
    console.log('3. Test automatic refresh when access token expires');
    console.log('4. Test page load with only refresh token (simulating expired access token)');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Test the current authentication state in the browser
async function testBrowserAuthState() {
  console.log('\n🌐 Testing Browser Authentication State...\n');
  
  try {
    // Test protected route
    console.log('1️⃣ Testing protected route access...');
    const profileResponse = await makeRequest(`${FRONTEND_URL}/profile`, {
      method: 'GET'
    });
    
    console.log('📊 Profile page response:', {
      status: profileResponse.status,
      redirected: profileResponse.status === 302 || profileResponse.status === 307
    });
    
    // Test API endpoints
    console.log('\n2️⃣ Testing API endpoints...');
    const apiMeResponse = await makeRequest(`${FRONTEND_URL}/api/auth/me`, {
      method: 'GET'
    });
    
    console.log('📊 API /me response:', {
      status: apiMeResponse.status,
      hasUser: !!apiMeResponse.data?.user
    });
    
  } catch (error) {
    console.error('❌ Browser auth test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  await testRefreshTokenMechanism();
  await testBrowserAuthState();
}

runAllTests();
