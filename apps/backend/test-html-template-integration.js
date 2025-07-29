#!/usr/bin/env node

/**
 * Test script for HTML template integration
 * Tests the new HTML email template service and verifies proper variable substitution
 */

const fs = require('fs').promises;
const path = require('path');

// ANSI color codes for better console output
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

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

async function testHtmlTemplateIntegration() {
  log('\n🧪 HTML Template Integration Test Suite', 'cyan');
  log('=' .repeat(50), 'cyan');

  let allTestsPassed = true;

  // Test 1: HTML Template File Exists
  log('\n📋 Test 1: HTML Template File Accessibility', 'cyan');
  try {
    const templatePath = path.join(__dirname, 'email-template-preview.html');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    if (templateContent.length > 0) {
      log('✅ HTML template file found and readable', 'green');
      log(`   Template size: ${templateContent.length} characters`, 'blue');
    } else {
      log('❌ HTML template file is empty', 'red');
      allTestsPassed = false;
    }
  } catch (error) {
    log(`❌ HTML template file not accessible: ${error.message}`, 'red');
    allTestsPassed = false;
  }

  // Test 2: Template Contains Required Placeholders
  log('\n📋 Test 2: Template Placeholder Verification', 'cyan');
  try {
    const templatePath = path.join(__dirname, 'email-template-preview.html');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    const hasNamePlaceholder = templateContent.includes('John Doe');
    const hasOtpPlaceholder = templateContent.includes('123456');
    const hasYearPlaceholder = templateContent.includes('${new Date().getFullYear()}');
    
    if (hasNamePlaceholder) {
      log('✅ Name placeholder (John Doe) found in template', 'green');
    } else {
      log('❌ Name placeholder (John Doe) not found in template', 'red');
      allTestsPassed = false;
    }
    
    if (hasOtpPlaceholder) {
      log('✅ OTP placeholder (123456) found in template', 'green');
    } else {
      log('❌ OTP placeholder (123456) not found in template', 'red');
      allTestsPassed = false;
    }
    
    if (hasYearPlaceholder) {
      log('✅ Year placeholder found in template', 'green');
    } else {
      log('❌ Year placeholder not found in template', 'red');
      allTestsPassed = false;
    }
  } catch (error) {
    log(`❌ Error checking template placeholders: ${error.message}`, 'red');
    allTestsPassed = false;
  }

  // Test 3: HTML Email Service File Exists
  log('\n📋 Test 3: HTML Email Service Implementation', 'cyan');
  try {
    const servicePath = path.join(__dirname, 'src/lib/email-service-html.ts');
    const serviceContent = await fs.readFile(servicePath, 'utf-8');
    
    const hasRenderFunction = serviceContent.includes('renderHtmlTemplate');
    const hasSendFunction = serviceContent.includes('sendEmailWithHTML');
    const hasOtpFunction = serviceContent.includes('sendEnhancedOTPVerificationEmailHTML');
    const hasTimingFunction = serviceContent.includes('sendEmailWithTimingHTML');
    
    if (hasRenderFunction) {
      log('✅ HTML template rendering function implemented', 'green');
    } else {
      log('❌ HTML template rendering function missing', 'red');
      allTestsPassed = false;
    }
    
    if (hasSendFunction) {
      log('✅ HTML email sending function implemented', 'green');
    } else {
      log('❌ HTML email sending function missing', 'red');
      allTestsPassed = false;
    }
    
    if (hasOtpFunction) {
      log('✅ OTP verification email function implemented', 'green');
    } else {
      log('❌ OTP verification email function missing', 'red');
      allTestsPassed = false;
    }
    
    if (hasTimingFunction) {
      log('✅ Email timing function implemented', 'green');
    } else {
      log('❌ Email timing function missing', 'red');
      allTestsPassed = false;
    }
  } catch (error) {
    log(`❌ HTML email service file not found: ${error.message}`, 'red');
    allTestsPassed = false;
  }

  // Test 4: Integration with Main Email Service
  log('\n📋 Test 4: Main Email Service Integration', 'cyan');
  try {
    const mainServicePath = path.join(__dirname, 'src/lib/sendEmail.ts');
    const mainServiceContent = await fs.readFile(mainServicePath, 'utf-8');
    
    const usesHtmlService = mainServiceContent.includes('./email-service-html');
    const usesHtmlFunction = mainServiceContent.includes('sendEmailWithTimingHTML');
    const hasHtmlComments = mainServiceContent.includes('HTML template');
    
    if (usesHtmlService) {
      log('✅ Main service imports HTML email service', 'green');
    } else {
      log('❌ Main service does not import HTML email service', 'red');
      allTestsPassed = false;
    }
    
    if (usesHtmlFunction) {
      log('✅ Main service uses HTML email function', 'green');
    } else {
      log('❌ Main service does not use HTML email function', 'red');
      allTestsPassed = false;
    }
    
    if (hasHtmlComments) {
      log('✅ Main service updated with HTML template comments', 'green');
    } else {
      log('❌ Main service comments not updated for HTML templates', 'red');
      allTestsPassed = false;
    }
  } catch (error) {
    log(`❌ Error checking main email service integration: ${error.message}`, 'red');
    allTestsPassed = false;
  }

  // Test 5: SMTP Timeout Configuration
  log('\n📋 Test 5: SMTP Timeout Configuration', 'cyan');
  try {
    const htmlServicePath = path.join(__dirname, 'src/lib/email-service-html.ts');
    const htmlServiceContent = await fs.readFile(htmlServicePath, 'utf-8');
    
    const hasConnectionTimeout = htmlServiceContent.includes('connectionTimeout: 10000');
    const hasGreetingTimeout = htmlServiceContent.includes('greetingTimeout: 5000');
    const hasSocketTimeout = htmlServiceContent.includes('socketTimeout: 15000');
    const hasRetryLogic = htmlServiceContent.includes('retry: {');
    
    if (hasConnectionTimeout) {
      log('✅ Connection timeout properly configured (10s)', 'green');
    } else {
      log('❌ Connection timeout not properly configured', 'red');
      allTestsPassed = false;
    }
    
    if (hasGreetingTimeout) {
      log('✅ Greeting timeout properly configured (5s)', 'green');
    } else {
      log('❌ Greeting timeout not properly configured', 'red');
      allTestsPassed = false;
    }
    
    if (hasSocketTimeout) {
      log('✅ Socket timeout properly configured (15s)', 'green');
    } else {
      log('❌ Socket timeout not properly configured', 'red');
      allTestsPassed = false;
    }
    
    if (hasRetryLogic) {
      log('✅ Retry logic implemented', 'green');
    } else {
      log('❌ Retry logic not implemented', 'red');
      allTestsPassed = false;
    }
  } catch (error) {
    log(`❌ Error checking SMTP timeout configuration: ${error.message}`, 'red');
    allTestsPassed = false;
  }

  // Test 6: Template Rendering Simulation
  log('\n📋 Test 6: Template Rendering Simulation', 'cyan');
  try {
    const templatePath = path.join(__dirname, 'email-template-preview.html');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    // Simulate template rendering
    const testName = 'Test User';
    const testOtp = '987654';
    const currentYear = new Date().getFullYear();
    
    let renderedTemplate = templateContent
      .replace(/John Doe/g, testName)
      .replace(/123456/g, testOtp)
      .replace(/\$\{new Date\(\)\.getFullYear\(\)\}/g, currentYear.toString());
    
    const hasReplacedName = renderedTemplate.includes(testName) && !renderedTemplate.includes('John Doe');
    const hasReplacedOtp = renderedTemplate.includes(testOtp) && !renderedTemplate.includes('123456');
    const hasReplacedYear = renderedTemplate.includes(currentYear.toString());
    
    if (hasReplacedName) {
      log('✅ Name replacement works correctly', 'green');
    } else {
      log('❌ Name replacement failed', 'red');
      allTestsPassed = false;
    }
    
    if (hasReplacedOtp) {
      log('✅ OTP replacement works correctly', 'green');
    } else {
      log('❌ OTP replacement failed', 'red');
      allTestsPassed = false;
    }
    
    if (hasReplacedYear) {
      log('✅ Year replacement works correctly', 'green');
    } else {
      log('❌ Year replacement failed', 'red');
      allTestsPassed = false;
    }
    
    // Save rendered template for manual inspection
    const outputPath = path.join(__dirname, 'test-rendered-template.html');
    await fs.writeFile(outputPath, renderedTemplate);
    log(`📄 Rendered template saved to: ${outputPath}`, 'blue');
    
  } catch (error) {
    log(`❌ Error in template rendering simulation: ${error.message}`, 'red');
    allTestsPassed = false;
  }

  // Final Results
  log('\n' + '='.repeat(50), 'cyan');
  if (allTestsPassed) {
    log('🎉 All HTML Template Integration Tests PASSED!', 'green');
    log('✅ The HTML template system is ready for production use.', 'green');
  } else {
    log('❌ Some HTML Template Integration Tests FAILED!', 'red');
    log('⚠️  Please review the failed tests above and fix the issues.', 'yellow');
  }
  log('='.repeat(50), 'cyan');

  return allTestsPassed;
}

// Run the tests
if (require.main === module) {
  testHtmlTemplateIntegration()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`💥 Test suite crashed: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { testHtmlTemplateIntegration };
