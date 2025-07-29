/**
 * Test file to verify email template consolidation
 * This file tests that all email functionality works after consolidating templates
 */

import { describe, it, expect } from 'bun:test';
import { 
  emailTemplates, 
  getFullTemplate, 
  getEnhancedFullTemplate,
  renderTemplate,
  renderEnhancedTemplate,
  validateEmailData,
  generateTestEmail,
  type EmailTemplateType,
  type EnhancedTemplateData,
  type OTPTemplateData,
  type PasswordResetTemplateData,
  type WelcomeTemplateData
} from '../lib/email-templates';

describe('Email Template Consolidation', () => {
  describe('Template Availability', () => {
    it('should have all required templates', () => {
      expect(emailTemplates.base).toBeTruthy();
      expect(emailTemplates.otpVerification).toBeTruthy();
      expect(emailTemplates.passwordReset).toBeTruthy();
      expect(emailTemplates.welcome).toBeTruthy();
    });

    it('should have enhanced email client compatibility features', () => {
      const baseTemplate = emailTemplates.base;
      
      // Check for XHTML DOCTYPE
      expect(baseTemplate).toContain('<!DOCTYPE html PUBLIC');
      expect(baseTemplate).toContain('XHTML 1.0 Transitional');
      
      // Check for email client namespaces
      expect(baseTemplate).toContain('xmlns:v="urn:schemas-microsoft-com:vml"');
      expect(baseTemplate).toContain('xmlns:o="urn:schemas-microsoft-com:office:office"');
      
      // Check for preheader support
      expect(baseTemplate).toContain('{{preheader}}');
      
      // Check for MSO conditional comments
      expect(baseTemplate).toContain('<!--[if gte mso 9]>');
    });
  });

  describe('Template Rendering Functions', () => {
    it('should render OTP verification template correctly', () => {
      const data: OTPTemplateData = {
        name: 'John Doe',
        otp: '123456'
      };

      const rendered = getFullTemplate('otpVerification', data);
      
      expect(rendered).toContain('John Doe');
      expect(rendered).toContain('123456');
      expect(rendered).toContain('Verify Your Email');
      expect(rendered).toContain('<!DOCTYPE html PUBLIC');
    });

    it('should render password reset template correctly', () => {
      const data: PasswordResetTemplateData = {
        name: 'Jane Smith',
        otp: '654321'
      };

      const rendered = getFullTemplate('passwordReset', data);
      
      expect(rendered).toContain('Jane Smith');
      expect(rendered).toContain('654321');
      expect(rendered).toContain('Reset Your Password');
      expect(rendered).toContain('<!DOCTYPE html PUBLIC');
    });

    it('should render welcome template correctly', () => {
      const data: WelcomeTemplateData = {
        name: 'Alex Johnson'
      };

      const rendered = getFullTemplate('welcome', data);
      
      expect(rendered).toContain('Alex Johnson');
      expect(rendered).toContain('Welcome to Hamsoya');
      expect(rendered).toContain('<!DOCTYPE html PUBLIC');
    });
  });

  describe('Enhanced Template Functions (Compatibility)', () => {
    it('should support enhanced template rendering for OTP verification', () => {
      const data: EnhancedTemplateData = {
        title: 'Custom Title - Hamsoya',
        preheader: 'Custom preheader text',
        name: 'Test User',
        otp: '999888'
      };

      const rendered = getEnhancedFullTemplate('otpVerification', data);
      
      expect(rendered).toContain('Test User');
      expect(rendered).toContain('999888');
      expect(rendered).toContain('Custom Title - Hamsoya');
      expect(rendered).toContain('Custom preheader text');
    });

    it('should support enhanced template rendering for password reset', () => {
      const data: EnhancedTemplateData = {
        name: 'Reset User',
        otp: '777666'
      };

      const rendered = getEnhancedFullTemplate('passwordReset', data);
      
      expect(rendered).toContain('Reset User');
      expect(rendered).toContain('777666');
      expect(rendered).toContain('Password Reset');
    });

    it('should support enhanced template rendering for welcome', () => {
      const data: EnhancedTemplateData = {
        name: 'Welcome User'
      };

      const rendered = getEnhancedFullTemplate('welcome', data);
      
      expect(rendered).toContain('Welcome User');
      expect(rendered).toContain('Welcome to Hamsoya');
    });
  });

  describe('Template Validation', () => {
    it('should validate OTP template data correctly', () => {
      const validData = { name: 'John Doe', otp: '123456' };
      const invalidData = { name: '', otp: '12345' }; // Invalid OTP length
      
      expect(validateEmailData('otpVerification', validData)).toBe(true);
      expect(validateEmailData('otpVerification', invalidData)).toBe(false);
    });

    it('should validate password reset template data correctly', () => {
      const validData = { name: 'Jane Smith', otp: '654321' };
      const invalidData = { name: 'Jane Smith' }; // Missing OTP
      
      expect(validateEmailData('passwordReset', validData)).toBe(true);
      expect(validateEmailData('passwordReset', invalidData)).toBe(false);
    });

    it('should validate welcome template data correctly', () => {
      const validData = { name: 'Alex Johnson' };
      const invalidData = { name: '' }; // Empty name
      
      expect(validateEmailData('welcome', validData)).toBe(true);
      expect(validateEmailData('welcome', invalidData)).toBe(false);
    });
  });

  describe('Test Email Generation', () => {
    it('should generate test emails for all template types', () => {
      const templates: EmailTemplateType[] = ['otpVerification', 'passwordReset', 'welcome'];
      
      templates.forEach(templateType => {
        const testEmail = generateTestEmail(templateType);
        expect(testEmail).toBeTruthy();
        expect(testEmail).toContain('<!DOCTYPE html PUBLIC');
        expect(testEmail).toContain('Hamsoya');
      });
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with enhanced template functions', () => {
      // Test that the enhanced functions work the same as regular functions
      const data = { name: 'Test User', otp: '123456' };
      
      const regularRender = renderTemplate('{{name}} - {{otp}}', data);
      const enhancedRender = renderEnhancedTemplate('{{name}} - {{otp}}', data);
      
      expect(regularRender).toBe(enhancedRender);
      expect(regularRender).toBe('Test User - 123456');
    });
  });

  describe('Email Client Compatibility Features', () => {
    it('should include mobile responsive styles', () => {
      const baseTemplate = emailTemplates.base;
      
      expect(baseTemplate).toContain('@media only screen and (max-width: 600px)');
      expect(baseTemplate).toContain('.mobile-padding');
      expect(baseTemplate).toContain('.mobile-center');
      expect(baseTemplate).toContain('.mobile-hide');
    });

    it('should include Gmail and Outlook specific fixes', () => {
      const baseTemplate = emailTemplates.base;
      
      expect(baseTemplate).toContain('.gmail-fix');
      expect(baseTemplate).toContain('.outlook-group-fix');
      expect(baseTemplate).toContain('mso-table-lspace');
      expect(baseTemplate).toContain('mso-table-rspace');
    });

    it('should include proper meta tags for email clients', () => {
      const baseTemplate = emailTemplates.base;
      
      expect(baseTemplate).toContain('meta name="format-detection"');
      expect(baseTemplate).toContain('content="telephone=no"');
      expect(baseTemplate).toContain('content="date=no"');
      expect(baseTemplate).toContain('content="address=no"');
      expect(baseTemplate).toContain('content="email=no"');
    });
  });
});

// Export test utilities for potential integration testing
export const testEmailTemplates = {
  otpData: { name: 'Test User', otp: '123456' },
  passwordResetData: { name: 'Test User', otp: '654321' },
  welcomeData: { name: 'Test User' },
};
