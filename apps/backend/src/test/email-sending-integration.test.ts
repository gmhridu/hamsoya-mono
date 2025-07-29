/**
 * Integration test for email sending functionality after template consolidation
 * This test verifies that email sending works with the consolidated templates
 */

import { describe, it, expect, beforeAll } from 'bun:test';
import { 
  sendEnhancedOTPVerificationEmail,
  sendEnhancedPasswordResetEmail,
  sendEnhancedWelcomeEmail
} from '../lib/sendEmail';

// Mock environment for testing (without actually sending emails)
const mockEnv = {
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_USER: 'test@example.com',
  SMTP_PASS: 'test-password',
  SMTP_SECURE: 'false'
};

describe('Email Sending Integration After Template Consolidation', () => {
  describe('Email Template Generation', () => {
    it('should generate OTP verification email without errors', async () => {
      // This test verifies that the template generation works
      // We're not actually sending emails, just testing template generation
      try {
        // Mock the actual email sending by catching the error
        await sendEnhancedOTPVerificationEmail(
          'test@example.com',
          'Test User',
          '123456',
          mockEnv
        );
      } catch (error: any) {
        // We expect this to fail due to invalid SMTP credentials
        // But the error should be about SMTP, not template generation
        expect(error.message).not.toContain('Template');
        expect(error.message).not.toContain('Enhanced template');
        expect(error.message).not.toContain('not found');
        
        // The error should be related to email sending, not template issues
        const isEmailError = error.message.includes('Invalid login') || 
                            error.message.includes('SMTP') ||
                            error.message.includes('authentication') ||
                            error.message.includes('connect') ||
                            error.message.includes('EAUTH') ||
                            error.message.includes('ECONNECTION');
        
        expect(isEmailError).toBe(true);
      }
    });

    it('should generate password reset email without errors', async () => {
      try {
        await sendEnhancedPasswordResetEmail(
          'test@example.com',
          'Test User',
          '654321',
          mockEnv
        );
      } catch (error: any) {
        // Same logic as above - should fail on SMTP, not templates
        expect(error.message).not.toContain('Template');
        expect(error.message).not.toContain('Enhanced template');
        expect(error.message).not.toContain('not found');
        
        const isEmailError = error.message.includes('Invalid login') || 
                            error.message.includes('SMTP') ||
                            error.message.includes('authentication') ||
                            error.message.includes('connect') ||
                            error.message.includes('EAUTH') ||
                            error.message.includes('ECONNECTION');
        
        expect(isEmailError).toBe(true);
      }
    });

    it('should generate welcome email without errors', async () => {
      try {
        await sendEnhancedWelcomeEmail(
          'test@example.com',
          'Test User',
          mockEnv
        );
      } catch (error: any) {
        // Same logic as above - should fail on SMTP, not templates
        expect(error.message).not.toContain('Template');
        expect(error.message).not.toContain('Enhanced template');
        expect(error.message).not.toContain('not found');
        
        const isEmailError = error.message.includes('Invalid login') || 
                            error.message.includes('SMTP') ||
                            error.message.includes('authentication') ||
                            error.message.includes('connect') ||
                            error.message.includes('EAUTH') ||
                            error.message.includes('ECONNECTION');
        
        expect(isEmailError).toBe(true);
      }
    });
  });

  describe('Template Import Verification', () => {
    it('should successfully import enhanced template functions', async () => {
      // Test that the imports work correctly
      const { getEnhancedFullTemplate, renderEnhancedTemplate } = await import('../lib/email-templates');
      
      expect(typeof getEnhancedFullTemplate).toBe('function');
      expect(typeof renderEnhancedTemplate).toBe('function');
    });

    it('should generate templates with enhanced features', async () => {
      const { getEnhancedFullTemplate } = await import('../lib/email-templates');
      
      const otpTemplate = getEnhancedFullTemplate('otpVerification', {
        name: 'Test User',
        otp: '123456',
        title: 'Test Email',
        preheader: 'Test preheader'
      });
      
      // Verify enhanced features are present
      expect(otpTemplate).toContain('<!DOCTYPE html PUBLIC'); // XHTML DOCTYPE
      expect(otpTemplate).toContain('xmlns:v="urn:schemas-microsoft-com:vml"'); // VML namespace
      expect(otpTemplate).toContain('xmlns:o="urn:schemas-microsoft-com:office:office"'); // Office namespace
      expect(otpTemplate).toContain('Test preheader'); // Preheader support
      expect(otpTemplate).toContain('Test User'); // Data rendering
      expect(otpTemplate).toContain('123456'); // OTP rendering
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with existing email functions', async () => {
      // Import both old and new functions to ensure they work
      const { 
        getFullTemplate, 
        getEnhancedFullTemplate,
        renderTemplate,
        renderEnhancedTemplate 
      } = await import('../lib/email-templates');
      
      const data = { name: 'Test User', otp: '123456' };
      
      // Both should work without errors
      const regularTemplate = getFullTemplate('otpVerification', data);
      const enhancedTemplate = getEnhancedFullTemplate('otpVerification', data);
      
      expect(regularTemplate).toBeTruthy();
      expect(enhancedTemplate).toBeTruthy();
      
      // Both should contain the same core content
      expect(regularTemplate).toContain('Test User');
      expect(enhancedTemplate).toContain('Test User');
      expect(regularTemplate).toContain('123456');
      expect(enhancedTemplate).toContain('123456');
    });
  });
});

// Export test utilities
export const emailTestUtils = {
  mockEnv,
  testData: {
    email: 'test@example.com',
    name: 'Test User',
    otp: '123456'
  }
};
