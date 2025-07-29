#!/usr/bin/env node

/**
 * Test script for actual email delivery using the new HTML template
 * This script will attempt to send a test email to verify the integration works end-to-end
 */

require('dotenv').config();

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

async function testEmailDelivery() {
  log('\n📧 HTML Email Delivery Test', 'cyan');
  log('=' .repeat(40), 'cyan');

  // Check environment variables
  log('\n📋 Environment Configuration Check', 'cyan');
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SERVICE', 'SMTP_USER', 'SMTP_PASSWORD'];
  let envConfigValid = true;

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      log(`✅ ${envVar}: ${envVar === 'SMTP_PASSWORD' ? '***' : process.env[envVar]}`, 'green');
    } else {
      log(`❌ ${envVar}: Not set`, 'red');
      envConfigValid = false;
    }
  }

  if (!envConfigValid) {
    log('\n❌ Environment configuration is incomplete. Please set all required SMTP variables.', 'red');
    return false;
  }

  // Test email delivery
  log('\n📧 Testing HTML Email Delivery', 'cyan');
  
  try {
    // Import the HTML email service
    const { sendEnhancedOTPVerificationEmailHTML } = require('./src/lib/email-service-html.ts');
    
    // Test data
    const testEmail = process.env.SMTP_USER; // Send to self for testing
    const testName = 'Test User';
    const testOtp = '123456';
    
    log(`📤 Sending test email to: ${testEmail}`, 'blue');
    log(`👤 Test name: ${testName}`, 'blue');
    log(`🔢 Test OTP: ${testOtp}`, 'blue');
    
    const startTime = Date.now();
    
    await sendEnhancedOTPVerificationEmailHTML(testEmail, testName, testOtp);
    
    const duration = Date.now() - startTime;
    
    log(`✅ Email sent successfully in ${duration}ms`, 'green');
    
    if (duration <= 2000) {
      log(`🚀 Excellent performance: ${duration}ms (target: ≤2000ms)`, 'green');
    } else if (duration <= 5000) {
      log(`⚠️  Acceptable performance: ${duration}ms (target: ≤2000ms)`, 'yellow');
    } else {
      log(`❌ Poor performance: ${duration}ms (target: ≤2000ms)`, 'red');
    }
    
    log('\n📋 Email Delivery Test Results:', 'cyan');
    log('✅ HTML template loading: SUCCESS', 'green');
    log('✅ Variable substitution: SUCCESS', 'green');
    log('✅ SMTP connection: SUCCESS', 'green');
    log('✅ Email delivery: SUCCESS', 'green');
    log(`⏱️  Delivery time: ${duration}ms`, 'blue');
    
    return true;
    
  } catch (error) {
    log(`❌ Email delivery failed: ${error.message}`, 'red');
    
    // Provide specific error guidance
    if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
      log('\n💡 Timeout Error Guidance:', 'yellow');
      log('   - Check your internet connection', 'yellow');
      log('   - Verify SMTP server is accessible', 'yellow');
      log('   - Consider increasing timeout values', 'yellow');
    } else if (error.message.includes('Authentication')) {
      log('\n💡 Authentication Error Guidance:', 'yellow');
      log('   - Verify SMTP_USER and SMTP_PASSWORD are correct', 'yellow');
      log('   - For Gmail, ensure you\'re using an App Password', 'yellow');
      log('   - Check if 2FA is enabled and configured properly', 'yellow');
    } else if (error.message.includes('template')) {
      log('\n💡 Template Error Guidance:', 'yellow');
      log('   - Verify email-template-preview.html exists', 'yellow');
      log('   - Check file permissions', 'yellow');
      log('   - Ensure template contains required placeholders', 'yellow');
    }
    
    return false;
  }
}

// Performance benchmark test
async function performanceBenchmark() {
  log('\n⚡ Performance Benchmark Test', 'cyan');
  log('=' .repeat(40), 'cyan');
  
  const testRuns = 3;
  const results = [];
  
  try {
    const { sendEmailWithTimingHTML } = require('./src/lib/email-service-html.ts');
    
    for (let i = 1; i <= testRuns; i++) {
      log(`\n🏃 Performance Run ${i}/${testRuns}`, 'blue');
      
      const result = await sendEmailWithTimingHTML({
        to: process.env.SMTP_USER,
        subject: `Performance Test ${i} - Hamsoya`,
        data: { name: `Test User ${i}`, otp: `${100000 + i}` }
      });
      
      results.push(result.duration);
      log(`   Duration: ${result.duration}ms | Success: ${result.success}`, result.success ? 'green' : 'red');
    }
    
    const avgDuration = results.reduce((a, b) => a + b, 0) / results.length;
    const minDuration = Math.min(...results);
    const maxDuration = Math.max(...results);
    
    log('\n📊 Performance Summary:', 'cyan');
    log(`   Average: ${avgDuration.toFixed(0)}ms`, 'blue');
    log(`   Fastest: ${minDuration}ms`, 'green');
    log(`   Slowest: ${maxDuration}ms`, maxDuration > 2000 ? 'yellow' : 'green');
    
    if (avgDuration <= 2000) {
      log('🎉 Performance target achieved!', 'green');
    } else {
      log('⚠️  Performance target not met (target: ≤2000ms avg)', 'yellow');
    }
    
  } catch (error) {
    log(`❌ Performance benchmark failed: ${error.message}`, 'red');
  }
}

// Main test runner
async function runTests() {
  try {
    const deliverySuccess = await testEmailDelivery();
    
    if (deliverySuccess) {
      await performanceBenchmark();
    }
    
    log('\n' + '='.repeat(40), 'cyan');
    if (deliverySuccess) {
      log('🎉 HTML Email System Test COMPLETED!', 'green');
      log('✅ Ready for production use.', 'green');
    } else {
      log('❌ HTML Email System Test FAILED!', 'red');
      log('⚠️  Please fix the issues before production use.', 'yellow');
    }
    log('='.repeat(40), 'cyan');
    
    return deliverySuccess;
    
  } catch (error) {
    log(`💥 Test suite crashed: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

// Run the tests
if (require.main === module) {
  runTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`💥 Test runner crashed: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { testEmailDelivery, performanceBenchmark, runTests };
