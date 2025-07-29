/**
 * Test file to verify email template rendering after consolidation
 * This file tests that all enhanced email client compatibility features work correctly
 */

import { describe, it, expect } from 'bun:test';
import { 
  getEnhancedFullTemplate,
  renderEnhancedTemplate,
  generateTestEmail,
  type EnhancedTemplateData
} from '../lib/email-templates';

describe('Email Template Rendering Verification', () => {
  describe('Enhanced Email Client Compatibility Features', () => {
    it('should include XHTML DOCTYPE declaration', () => {
      const template = getEnhancedFullTemplate('otpVerification', {
        name: 'Test User',
        otp: '123456'
      });

      expect(template).toContain('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"');
      expect(template).toContain('http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd');
    });

    it('should include VML and Office namespaces for Outlook compatibility', () => {
      const template = getEnhancedFullTemplate('passwordReset', {
        name: 'Test User',
        otp: '654321'
      });

      expect(template).toContain('xmlns:v="urn:schemas-microsoft-com:vml"');
      expect(template).toContain('xmlns:o="urn:schemas-microsoft-com:office:office"');
    });

    it('should include preheader text support', () => {
      const customPreheader = 'Custom preheader for testing';
      const template = getEnhancedFullTemplate('welcome', {
        name: 'Test User',
        preheader: customPreheader
      });

      expect(template).toContain(customPreheader);
      expect(template).toContain('display: none'); // Hidden preheader styling
    });

    it('should include mobile responsive table-based layout', () => {
      const template = getEnhancedFullTemplate('otpVerification', {
        name: 'Test User',
        otp: '123456'
      });

      expect(template).toContain('role="presentation"');
      expect(template).toContain('cellspacing="0"');
      expect(template).toContain('cellpadding="0"');
      expect(template).toContain('@media only screen and (max-width: 600px)');
    });

    it('should include Gmail and Outlook specific fixes', () => {
      const template = getEnhancedFullTemplate('otpVerification', {
        name: 'Test User',
        otp: '123456'
      });

      expect(template).toContain('mso-table-lspace: 0pt');
      expect(template).toContain('mso-table-rspace: 0pt');
      expect(template).toContain('.gmail-fix');
      expect(template).toContain('.outlook-group-fix');
    });

    it('should include proper meta tags for email clients', () => {
      const template = getEnhancedFullTemplate('passwordReset', {
        name: 'Test User',
        otp: '654321'
      });

      expect(template).toContain('meta name="format-detection"');
      expect(template).toContain('content="telephone=no"');
      expect(template).toContain('content="date=no"');
      expect(template).toContain('content="address=no"');
      expect(template).toContain('content="email=no"');
    });
  });

  describe('Template Content Rendering', () => {
    it('should render OTP verification template with all data', () => {
      const data: EnhancedTemplateData = {
        name: 'John Doe',
        otp: '123456',
        title: 'Custom OTP Title',
        preheader: 'Your OTP is ready'
      };

      const template = getEnhancedFullTemplate('otpVerification', data);

      expect(template).toContain('John Doe');
      expect(template).toContain('123456');
      expect(template).toContain('Custom OTP Title');
      expect(template).toContain('Your OTP is ready');
      expect(template).toContain('Verify Your Email');
    });

    it('should render password reset template with all data', () => {
      const data: EnhancedTemplateData = {
        name: 'Jane Smith',
        otp: '654321',
        title: 'Password Reset - Hamsoya'
      };

      const template = getEnhancedFullTemplate('passwordReset', data);

      expect(template).toContain('Jane Smith');
      expect(template).toContain('654321');
      expect(template).toContain('Password Reset - Hamsoya');
      expect(template).toContain('Reset Your Password');
    });

    it('should render welcome template with all data', () => {
      const data: EnhancedTemplateData = {
        name: 'Alex Johnson',
        title: 'Welcome to Hamsoya!'
      };

      const template = getEnhancedFullTemplate('welcome', data);

      expect(template).toContain('Alex Johnson');
      expect(template).toContain('Welcome to Hamsoya!');
      expect(template).toContain('Welcome to Hamsoya');
    });

    it('should use default values when optional data is missing', () => {
      const template = getEnhancedFullTemplate('otpVerification', {
        name: 'Test User',
        otp: '123456'
      });

      expect(template).toContain('Verify Your Email - Hamsoya'); // Default title
      expect(template).toContain('Your verification code is 123456'); // Default preheader
    });
  });

  describe('Enhanced Template Functions', () => {
    it('should support renderEnhancedTemplate function', () => {
      const simpleTemplate = 'Hello {{name}}, your code is {{otp}}';
      const data = { name: 'Test User', otp: '123456' };

      const rendered = renderEnhancedTemplate(simpleTemplate, data);

      expect(rendered).toBe('Hello Test User, your code is 123456');
    });

    it('should handle special characters in template data', () => {
      const template = getEnhancedFullTemplate('otpVerification', {
        name: 'Test & User <script>',
        otp: '123456'
      });

      // Should escape HTML entities
      expect(template).toContain('Test &amp; User &lt;script&gt;');
      expect(template).not.toContain('<script>');
    });

    it('should generate valid HTML structure', () => {
      const template = getEnhancedFullTemplate('welcome', {
        name: 'Test User'
      });

      // Basic HTML structure validation
      expect(template).toContain('<html');
      expect(template).toContain('</html>');
      expect(template).toContain('<head>');
      expect(template).toContain('</head>');
      expect(template).toContain('<body');
      expect(template).toContain('</body>');
      expect(template).toContain('<table');
      expect(template).toContain('</table>');
    });
  });

  describe('Test Email Generation', () => {
    it('should generate test emails for all template types', () => {
      const templates = ['otpVerification', 'passwordReset', 'welcome'] as const;

      templates.forEach(templateType => {
        const testEmail = generateTestEmail(templateType);

        expect(testEmail).toBeTruthy();
        expect(testEmail).toContain('<!DOCTYPE html PUBLIC');
        expect(testEmail).toContain('Hamsoya');
        expect(testEmail).toContain('<table');
        expect(testEmail).toContain('role="presentation"');
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid template type', () => {
      expect(() => {
        getEnhancedFullTemplate('invalidTemplate' as any, { name: 'Test' });
      }).toThrow('Enhanced template \'invalidTemplate\' not found');
    });

    it('should handle missing required data gracefully', () => {
      // Should not throw error, but use defaults
      const template = getEnhancedFullTemplate('otpVerification', {
        name: 'Test User'
        // Missing OTP - should handle gracefully
      });

      expect(template).toContain('Test User');
      expect(template).toContain('{{otp}}'); // Should leave placeholder if data missing
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with existing template structure', () => {
      const enhancedTemplate = getEnhancedFullTemplate('otpVerification', {
        name: 'Test User',
        otp: '123456'
      });

      // Should contain all the essential elements
      expect(enhancedTemplate).toContain('Test User');
      expect(enhancedTemplate).toContain('123456');
      expect(enhancedTemplate).toContain('Hamsoya');
      expect(enhancedTemplate).toContain('verification');
    });
  });
});

// Export test utilities for integration testing
export const emailTemplateTestUtils = {
  sampleOTPData: { name: 'Test User', otp: '123456' },
  samplePasswordResetData: { name: 'Test User', otp: '654321' },
  sampleWelcomeData: { name: 'Test User' },
  
  validateEmailStructure: (html: string) => {
    return html.includes('<!DOCTYPE html PUBLIC') &&
           html.includes('xmlns:v="urn:schemas-microsoft-com:vml"') &&
           html.includes('role="presentation"') &&
           html.includes('@media only screen and (max-width: 600px)');
  }
};
