#!/usr/bin/env bun

/**
 * Comprehensive API Testing Script for Hamsoya Backend
 * 
 * This script tests all authentication endpoints and validates:
 * - Registration flow
 * - Email verification
 * - Login flow
 * - Password reset flow
 * - Rate limiting
 * - Error handling
 * - Security measures
 */

import { z } from 'zod';

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8787';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = 'Test User';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Utility functions
const log = (message: string, color: keyof typeof colors = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const logSuccess = (message: string) => log(`✅ ${message}`, 'green');
const logError = (message: string) => log(`❌ ${message}`, 'red');
const logInfo = (message: string) => log(`ℹ️  ${message}`, 'blue');
const logWarning = (message: string) => log(`⚠️  ${message}`, 'yellow');

// API client
class APIClient {
  private baseURL: string;
  private cookies: string[] = [];

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: any; status: number; headers: Headers }> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': this.cookies.join('; '),
        ...options.headers,
      },
    });

    // Store cookies from response
    const setCookieHeaders = response.headers.getSetCookie();
    if (setCookieHeaders.length > 0) {
      this.cookies.push(...setCookieHeaders);
    }

    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  }

  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, body: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  clearCookies() {
    this.cookies = [];
  }
}

// Test suite
class TestSuite {
  private client: APIClient;
  private testResults: { name: string; passed: boolean; error?: string }[] = [];

  constructor(apiBaseURL: string) {
    this.client = new APIClient(apiBaseURL);
  }

  private async test(name: string, testFn: () => Promise<void>) {
    try {
      logInfo(`Running test: ${name}`);
      await testFn();
      this.testResults.push({ name, passed: true });
      logSuccess(`Test passed: ${name}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.testResults.push({ name, passed: false, error: errorMessage });
      logError(`Test failed: ${name} - ${errorMessage}`);
    }
  }

  async runAllTests() {
    log('\n🚀 Starting Hamsoya Backend API Tests\n', 'bright');

    // Health check
    await this.test('Health Check', async () => {
      const response = await this.client.get('/api/health');
      if (response.status !== 200) {
        throw new Error(`Health check failed with status ${response.status}`);
      }
      if (response.data?.status !== 'ok') {
        throw new Error('Health check returned invalid status');
      }
    });

    // Registration tests
    await this.test('User Registration', async () => {
      const response = await this.client.post('/api/auth/register', {
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        role: 'USER',
      });
      
      if (response.status !== 201) {
        throw new Error(`Registration failed with status ${response.status}: ${JSON.stringify(response.data)}`);
      }
      
      if (!response.data?.success) {
        throw new Error('Registration response indicates failure');
      }
    });

    // Registration validation tests
    await this.test('Registration Validation - Invalid Email', async () => {
      const response = await this.client.post('/api/auth/register', {
        name: TEST_NAME,
        email: 'invalid-email',
        password: TEST_PASSWORD,
        role: 'USER',
      });
      
      if (response.status !== 400) {
        throw new Error('Should reject invalid email');
      }
    });

    await this.test('Registration Validation - Weak Password', async () => {
      const response = await this.client.post('/api/auth/register', {
        name: TEST_NAME,
        email: 'test2@example.com',
        password: '123',
        role: 'USER',
      });
      
      if (response.status !== 400) {
        throw new Error('Should reject weak password');
      }
    });

    // Duplicate registration test
    await this.test('Duplicate Registration Prevention', async () => {
      const response = await this.client.post('/api/auth/register', {
        name: TEST_NAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        role: 'USER',
      });
      
      if (response.status !== 409 && response.status !== 400) {
        throw new Error('Should prevent duplicate registration');
      }
    });

    // OTP verification test (mock)
    await this.test('OTP Verification - Invalid OTP', async () => {
      const response = await this.client.post('/api/auth/verify', {
        email: TEST_EMAIL,
        otp: '000000',
      });
      
      if (response.status !== 400) {
        throw new Error('Should reject invalid OTP');
      }
    });

    // Login test (should fail since email not verified)
    await this.test('Login - Unverified Email', async () => {
      const response = await this.client.post('/api/auth/login', {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      });
      
      if (response.status !== 401) {
        throw new Error('Should reject login for unverified email');
      }
    });

    // Login validation tests
    await this.test('Login Validation - Invalid Credentials', async () => {
      const response = await this.client.post('/api/auth/login', {
        email: TEST_EMAIL,
        password: 'wrongpassword',
      });
      
      if (response.status !== 401) {
        throw new Error('Should reject invalid credentials');
      }
    });

    // Forgot password test
    await this.test('Forgot Password', async () => {
      const response = await this.client.post('/api/auth/forgot-password', {
        email: TEST_EMAIL,
      });
      
      if (response.status !== 200) {
        throw new Error(`Forgot password failed with status ${response.status}`);
      }
    });

    // Rate limiting test
    await this.test('Rate Limiting - Multiple Requests', async () => {
      // Clear cookies to simulate different session
      this.client.clearCookies();
      
      const promises = Array(5).fill(null).map(() =>
        this.client.post('/api/auth/forgot-password', {
          email: 'ratelimit@example.com',
        })
      );
      
      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      if (rateLimitedResponses.length === 0) {
        logWarning('Rate limiting may not be working properly');
      }
    });

    // tRPC health check
    await this.test('tRPC Health Check', async () => {
      const response = await this.client.post('/trpc/health.check', {});
      
      if (response.status !== 200) {
        throw new Error(`tRPC health check failed with status ${response.status}`);
      }
    });

    // Print results
    this.printResults();
  }

  private printResults() {
    log('\n📊 Test Results Summary\n', 'bright');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;
    const total = this.testResults.length;
    
    log(`Total Tests: ${total}`, 'blue');
    log(`Passed: ${passed}`, 'green');
    log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
    log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`, failed > 0 ? 'yellow' : 'green');
    
    if (failed > 0) {
      log('\n❌ Failed Tests:', 'red');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => {
          log(`  • ${r.name}: ${r.error}`, 'red');
        });
    }
    
    log('\n✨ Testing completed!\n', 'bright');
    
    // Exit with appropriate code
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Main execution
async function main() {
  const testSuite = new TestSuite(API_BASE_URL);
  await testSuite.runAllTests();
}

// Run tests
if (import.meta.main) {
  main().catch((error) => {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
  });
}
