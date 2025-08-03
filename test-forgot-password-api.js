#!/usr/bin/env node

/**
 * Simple test script to verify the forgot password API behavior
 * Tests both unregistered and registered email scenarios
 */

const API_BASE = 'http://localhost:8787/api';

async function testForgotPasswordAPI() {
  console.log('🧪 Testing Forgot Password API...\n');

  // Test 1: Unregistered email should return 404
  console.log('📧 Test 1: Unregistered email (hasanhridoymahabub9@gmail.com)');
  try {
    const response = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'hasanhridoymahabub9@gmail.com'
      })
    });

    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);
    
    if (response.status === 404) {
      console.log('   ✅ PASS: Correctly returns 404 for unregistered email');
    } else {
      console.log('   ❌ FAIL: Should return 404 for unregistered email');
    }
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Invalid email format
  console.log('📧 Test 2: Invalid email format (invalid-email)');
  try {
    const response = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email'
      })
    });

    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);
    
    if (response.status === 400) {
      console.log('   ✅ PASS: Correctly returns 400 for invalid email format');
    } else {
      console.log('   ❌ FAIL: Should return 400 for invalid email format');
    }
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Empty email
  console.log('📧 Test 3: Empty email');
  try {
    const response = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ''
      })
    });

    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, data);
    
    if (response.status === 400) {
      console.log('   ✅ PASS: Correctly returns 400 for empty email');
    } else {
      console.log('   ❌ FAIL: Should return 400 for empty email');
    }
  } catch (error) {
    console.log('   ❌ ERROR:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 4: Check if there are any registered users to test with
  console.log('📧 Test 4: Testing with potentially registered email');
  const testEmails = [
    'admin@hamsoya.com',
    'test@example.com',
    'user@test.com',
    'demo@hamsoya.com'
  ];

  for (const email of testEmails) {
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      console.log(`   Testing ${email}:`);
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log(`   ✅ REGISTERED: ${email} exists in database`);
        console.log(`   Response:`, data);
        break; // Found a registered email, no need to test more
      } else if (response.status === 404) {
        console.log(`   ℹ️  NOT REGISTERED: ${email} not found`);
      } else {
        console.log(`   ⚠️  UNEXPECTED: ${response.status} for ${email}`);
        console.log(`   Response:`, data);
      }
    } catch (error) {
      console.log(`   ❌ ERROR testing ${email}:`, error.message);
    }
  }

  console.log('\n🎯 Test Summary:');
  console.log('   - Unregistered emails should return 404 with proper error message');
  console.log('   - Invalid email formats should return 400');
  console.log('   - Registered emails should return 200 and proceed to verification');
  console.log('   - Frontend should NOT navigate to verify page on any error');
  
  console.log('\n✨ API testing complete!');
}

// Run the tests
testForgotPasswordAPI().catch(console.error);
