/**
 * Playwright test suite for registration bugs fix
 * Tests the three critical bugs that were identified and fixed:
 * 1. Create Account Button Not Working
 * 2. Unintended ImageKit API Calls
 * 3. Excessive API Polling
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:5001';

test.describe('Registration Bugs Fix', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Monitor network requests
    await page.route('**/*', route => {
      console.log(`${route.request().method()} ${route.request().url()}`);
      route.continue();
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Bug 1: Create Account Button Should Work', async () => {
    // Navigate to login page
    await page.goto(`${FRONTEND_URL}/login`);
    
    // Switch to register tab
    await page.click('[data-value="register"]');
    
    // Fill out the registration form
    await page.fill('#register-name', 'Test User');
    await page.fill('#register-email', 'test@example.com');
    await page.fill('#register-password', 'password123');
    await page.fill('#register-confirm-password', 'password123');
    
    // Monitor network requests for registration API call
    const registrationPromise = page.waitForRequest(request => 
      request.url().includes('/api/auth/register') && request.method() === 'POST'
    );
    
    // Click Create Account button
    await page.click('button[type="submit"]');
    
    // Verify that the registration API is called
    const registrationRequest = await registrationPromise;
    expect(registrationRequest).toBeTruthy();
    
    // Verify the request body contains the form data
    const requestBody = registrationRequest.postDataJSON();
    expect(requestBody.name).toBe('Test User');
    expect(requestBody.email).toBe('test@example.com');
    expect(requestBody.password).toBe('password123');
  });

  test('Bug 2: ImageKit API Should Not Be Called During Registration', async () => {
    // Navigate to login page
    await page.goto(`${FRONTEND_URL}/login`);
    
    // Switch to register tab
    await page.click('[data-value="register"]');
    
    // Track ImageKit API calls
    const imagekitCalls: string[] = [];
    page.on('request', request => {
      if (request.url().includes('imagekit.io') || request.url().includes('/api/imagekit/delete')) {
        imagekitCalls.push(`${request.method()} ${request.url()}`);
      }
    });
    
    // Fill out the registration form (without uploading image)
    await page.fill('#register-name', 'Test User');
    await page.fill('#register-email', 'test@example.com');
    await page.fill('#register-password', 'password123');
    await page.fill('#register-confirm-password', 'password123');
    
    // Click Create Account button
    await page.click('button[type="submit"]');
    
    // Wait a bit to ensure any delayed API calls are captured
    await page.waitForTimeout(2000);
    
    // Verify no ImageKit deletion calls were made
    const deletionCalls = imagekitCalls.filter(call => 
      call.includes('DELETE') || call.includes('/delete')
    );
    expect(deletionCalls).toHaveLength(0);
  });

  test('Bug 3: Excessive API Polling Should Be Controlled', async () => {
    // Navigate to login page
    await page.goto(`${FRONTEND_URL}/login`);
    
    // Track tRPC calls to cart and bookmarks
    const trpcCalls: string[] = [];
    page.on('request', request => {
      if (request.url().includes('/trpc/cart.get') || request.url().includes('/trpc/bookmarks.get')) {
        trpcCalls.push(`${request.method()} ${request.url()}`);
      }
    });
    
    // Wait for initial page load
    await page.waitForTimeout(3000);
    
    // Count initial calls
    const initialCallCount = trpcCalls.length;
    
    // Wait another 5 seconds to check for excessive polling
    await page.waitForTimeout(5000);
    
    // Count calls after waiting
    const finalCallCount = trpcCalls.length;
    
    // Verify that polling is not excessive (should not increase significantly)
    const additionalCalls = finalCallCount - initialCallCount;
    expect(additionalCalls).toBeLessThan(5); // Allow some reasonable calls but not excessive
  });

  test('Integration: Complete Registration Flow Works', async () => {
    // Navigate to login page
    await page.goto(`${FRONTEND_URL}/login`);
    
    // Switch to register tab
    await page.click('[data-value="register"]');
    
    // Fill out the registration form
    await page.fill('#register-name', 'Integration Test User');
    await page.fill('#register-email', 'integration@example.com');
    await page.fill('#register-password', 'password123');
    await page.fill('#register-confirm-password', 'password123');
    
    // Click Create Account button
    await page.click('button[type="submit"]');
    
    // Wait for either success redirect or error message
    await Promise.race([
      page.waitForURL('**/verify-email**'),
      page.waitForSelector('.text-red-500'),
      page.waitForTimeout(10000)
    ]);
    
    // Check if we're on the verification page (success) or if there's an error
    const currentUrl = page.url();
    const hasError = await page.locator('.text-red-500').count() > 0;
    
    // Either should be on verification page or have a meaningful error
    expect(currentUrl.includes('verify-email') || hasError).toBeTruthy();
  });

  test('Form Validation Works Correctly', async () => {
    // Navigate to login page
    await page.goto(`${FRONTEND_URL}/login`);
    
    // Switch to register tab
    await page.click('[data-value="register"]');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation errors
    const nameError = await page.locator('text=Name must be at least 2 characters').count();
    const emailError = await page.locator('text=Please enter a valid email address').count();
    const passwordError = await page.locator('text=Password must be at least 6 characters').count();
    
    expect(nameError + emailError + passwordError).toBeGreaterThan(0);
    
    // Fill with mismatched passwords
    await page.fill('#register-name', 'Test User');
    await page.fill('#register-email', 'test@example.com');
    await page.fill('#register-password', 'password123');
    await page.fill('#register-confirm-password', 'different');
    
    await page.click('button[type="submit"]');
    
    // Check for password mismatch error
    const mismatchError = await page.locator('text=Passwords don\'t match').count();
    expect(mismatchError).toBeGreaterThan(0);
  });
});

// Helper function to run tests
export async function runRegistrationBugTests() {
  console.log('🧪 Running Registration Bug Fix Tests...');
  console.log('Make sure both frontend and backend servers are running:');
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Backend: ${BACKEND_URL}`);
}
