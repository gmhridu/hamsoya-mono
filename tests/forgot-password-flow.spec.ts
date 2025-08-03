import { test, expect } from '@playwright/test';

test.describe('Forgot Password Flow', () => {
  const UNREGISTERED_EMAIL = 'hasanhridoymahabub9@gmail.com';
  const REGISTERED_EMAIL = 'test@example.com'; // Assuming this exists in test DB
  const BASE_URL = 'http://localhost:3001';

  test.beforeEach(async ({ page }) => {
    // Navigate to forgot password page
    await page.goto(`${BASE_URL}/forgot-password`);
    await expect(page).toHaveTitle(/Forgot Password/);
  });

  test('should show error and stay on form for unregistered email', async ({ page }) => {
    // Fill in unregistered email
    await page.fill('input[type="email"]', UNREGISTERED_EMAIL);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for API call to complete
    await page.waitForTimeout(2000);

    // Should show error message
    await expect(page.locator('text=This email address is not registered')).toBeVisible();

    // Should NOT navigate to verification page
    await expect(page).toHaveURL(`${BASE_URL}/forgot-password`);

    // Form should still be visible and functional
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Error should be displayed in red styling
    const errorElement = page.locator('[class*="red"]').filter({ hasText: 'This email address is not registered' });
    await expect(errorElement).toBeVisible();
  });

  test('should show proper error styling and messaging', async ({ page }) => {
    // Fill in unregistered email
    await page.fill('input[type="email"]', UNREGISTERED_EMAIL);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for error to appear
    await page.waitForSelector('[class*="red"]', { timeout: 5000 });

    // Check error message content
    const errorMessage = page.locator('text=This email address is not registered. Please check your email or create a new account.');
    await expect(errorMessage).toBeVisible();

    // Check error styling (red background/border)
    const errorContainer = page.locator('.bg-red-50, .border-red-200').first();
    await expect(errorContainer).toBeVisible();

    // Check error icon
    const errorIcon = page.locator('[class*="red"]').locator('span').filter({ hasText: '!' });
    await expect(errorIcon).toBeVisible();
  });

  test('should allow user to correct email after error', async ({ page }) => {
    // First, trigger error with unregistered email
    await page.fill('input[type="email"]', UNREGISTERED_EMAIL);
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=This email address is not registered', { timeout: 5000 });

    // Clear the email field
    await page.fill('input[type="email"]', '');

    // Error should still be visible
    await expect(page.locator('text=This email address is not registered')).toBeVisible();

    // Enter a different email
    await page.fill('input[type="email"]', 'different@example.com');

    // Form should be submittable again
    await expect(page.locator('button[type="submit"]')).toBeEnabled();

    // Email field should have the new value
    await expect(page.locator('input[type="email"]')).toHaveValue('different@example.com');
  });

  test('should show loading state during API call', async ({ page }) => {
    // Fill in email
    await page.fill('input[type="email"]', UNREGISTERED_EMAIL);

    // Submit form and immediately check loading state
    await page.click('button[type="submit"]');

    // Should show loading spinner and text
    await expect(page.locator('text=Sending Code...')).toBeVisible();
    await expect(page.locator('[class*="animate-spin"]')).toBeVisible();

    // Button should be disabled during loading
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    // Wait for loading to complete
    await page.waitForTimeout(2000);

    // Loading state should be gone
    await expect(page.locator('text=Sending Code...')).not.toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('should have proper form validation', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show HTML5 validation or custom validation
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeFocused();

    // Try invalid email format
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');

    // Should show validation error (either HTML5 or custom)
    const isHTML5Valid = await emailInput.evaluate((input: HTMLInputElement) => input.validity.valid);
    expect(isHTML5Valid).toBe(false);
  });

  test('should have proper navigation links', async ({ page }) => {
    // Check "Sign In" link
    const signInLink = page.locator('a[href="/login"]');
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveText(/Sign In/);

    // Check back arrow link (if exists)
    const backLink = page.locator('a').filter({ hasText: /back|arrow/i }).first();
    if (await backLink.count() > 0) {
      await expect(backLink).toBeVisible();
    }

    // Check brand logo link
    const brandLink = page.locator('a[href="/"]').first();
    await expect(brandLink).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept API call and simulate network error
    await page.route('**/api/auth/forgot-password', route => {
      route.abort('failed');
    });

    // Fill in email and submit
    await page.fill('input[type="email"]', UNREGISTERED_EMAIL);
    await page.click('button[type="submit"]');

    // Wait for error handling
    await page.waitForTimeout(2000);

    // Should show network error message
    await expect(page.locator('text=Network error')).toBeVisible();

    // Should stay on forgot password page
    await expect(page).toHaveURL(`${BASE_URL}/forgot-password`);
  });

  test('should handle server errors gracefully', async ({ page }) => {
    // Intercept API call and simulate server error
    await page.route('**/api/auth/forgot-password', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error',
          statusCode: 500
        })
      });
    });

    // Fill in email and submit
    await page.fill('input[type="email"]', UNREGISTERED_EMAIL);
    await page.click('button[type="submit"]');

    // Wait for error handling
    await page.waitForTimeout(2000);

    // Should show server error message
    await expect(page.locator('text=Server error')).toBeVisible();

    // Should stay on forgot password page
    await expect(page).toHaveURL(`${BASE_URL}/forgot-password`);
  });

  test('should not navigate to verify page on any error', async ({ page }) => {
    const testCases = [
      { email: UNREGISTERED_EMAIL, expectedError: 'not registered' },
      { email: 'invalid-format', expectedError: 'invalid' },
      { email: '', expectedError: 'required' }
    ];

    for (const testCase of testCases) {
      // Clear form
      await page.fill('input[type="email"]', '');

      // Fill in test email
      if (testCase.email) {
        await page.fill('input[type="email"]', testCase.email);
      }

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for any processing
      await page.waitForTimeout(2000);

      // Should NOT navigate to verify page
      await expect(page).toHaveURL(`${BASE_URL}/forgot-password`);

      // Should still show the form
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    }
  });

  test('should navigate to verify page for registered email (mocked)', async ({ page }) => {
    // Mock successful API response for registered email
    await page.route('**/api/auth/forgot-password', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            message: 'If an account with this email exists, you will receive a password reset OTP.'
          }
        })
      });
    });

    // Fill in registered email
    await page.fill('input[type="email"]', REGISTERED_EMAIL);

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(`${BASE_URL}/forgot-password/verify?email=${encodeURIComponent(REGISTERED_EMAIL)}`, { timeout: 5000 });

    // Should be on verify page
    await expect(page).toHaveURL(`${BASE_URL}/forgot-password/verify?email=${encodeURIComponent(REGISTERED_EMAIL)}`);

    // Should show verification form
    await expect(page.locator('text=Verify Your Code')).toBeVisible();
    await expect(page.locator('input[data-otp-input]')).toBeVisible();
  });
});
