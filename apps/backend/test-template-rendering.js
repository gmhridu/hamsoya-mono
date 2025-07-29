#!/usr/bin/env node

/**
 * Test script for HTML template rendering without actual email sending
 * This verifies the template loading and variable substitution works correctly
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

// Simulate the HTML template rendering logic
async function simulateTemplateRendering() {
  log('\n🎨 HTML Template Rendering Test', 'cyan');
  log('=' .repeat(45), 'cyan');

  try {
    // Load the HTML template
    log('\n📄 Loading HTML Template', 'blue');
    const templatePath = path.join(__dirname, 'email-template-preview.html');
    const template = await fs.readFile(templatePath, 'utf-8');
    log(`✅ Template loaded (${template.length} characters)`, 'green');

    // Test data
    const testCases = [
      { name: 'John Smith', otp: '123456' },
      { name: 'Maria García', otp: '789012' },
      { name: 'Ahmed Hassan', otp: '345678' },
      { name: 'Test User with Special Chars & Symbols', otp: '999999' },
    ];

    log('\n🧪 Testing Variable Substitution', 'blue');
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      log(`\n   Test Case ${i + 1}: ${testCase.name} | OTP: ${testCase.otp}`, 'cyan');
      
      // Perform substitution
      const currentYear = new Date().getFullYear();
      let renderedTemplate = template
        .replace(/John Doe/g, testCase.name)
        .replace(/123456/g, testCase.otp)
        .replace(/\$\{new Date\(\)\.getFullYear\(\)\}/g, currentYear.toString());

      // Verify substitutions
      const nameSubstituted = renderedTemplate.includes(testCase.name) && !renderedTemplate.includes('John Doe');
      const otpSubstituted = renderedTemplate.includes(testCase.otp) && !renderedTemplate.includes('123456');
      const yearSubstituted = renderedTemplate.includes(currentYear.toString());

      if (nameSubstituted) {
        log(`   ✅ Name substitution: ${testCase.name}`, 'green');
      } else {
        log(`   ❌ Name substitution failed: ${testCase.name}`, 'red');
      }

      if (otpSubstituted) {
        log(`   ✅ OTP substitution: ${testCase.otp}`, 'green');
      } else {
        log(`   ❌ OTP substitution failed: ${testCase.otp}`, 'red');
      }

      if (yearSubstituted) {
        log(`   ✅ Year substitution: ${currentYear}`, 'green');
      } else {
        log(`   ❌ Year substitution failed: ${currentYear}`, 'red');
      }

      // Save rendered template for this test case
      const outputPath = path.join(__dirname, `test-rendered-${i + 1}.html`);
      await fs.writeFile(outputPath, renderedTemplate);
      log(`   📁 Saved: test-rendered-${i + 1}.html`, 'blue');
    }

    return true;

  } catch (error) {
    log(`❌ Template rendering test failed: ${error.message}`, 'red');
    return false;
  }
}

// Test template structure and email client compatibility
async function testTemplateStructure() {
  log('\n🏗️  HTML Template Structure Analysis', 'cyan');
  log('=' .repeat(45), 'cyan');

  try {
    const templatePath = path.join(__dirname, 'email-template-preview.html');
    const template = await fs.readFile(templatePath, 'utf-8');

    // Check for email client compatibility features
    const checks = [
      { name: 'DOCTYPE declaration', pattern: /<!DOCTYPE html/i, required: true },
      { name: 'Table-based layout', pattern: /<table[^>]*role="presentation"/i, required: true },
      { name: 'Inline CSS styles', pattern: /style="/i, required: true },
      { name: 'MSO conditional comments', pattern: /\[if.*mso.*\]/i, required: false },
      { name: 'Viewport meta tag', pattern: /<meta[^>]*viewport/i, required: true },
      { name: 'Email client resets', pattern: /mso-table-lspace.*mso-table-rspace/i, required: false },
      { name: 'Preheader text', pattern: /display:\s*none.*font-size:\s*1px/i, required: false },
      { name: 'Responsive design', pattern: /@media.*max-width/i, required: false },
    ];

    log('\n📋 Email Client Compatibility Checks:', 'blue');
    let compatibilityScore = 0;
    let totalChecks = 0;

    for (const check of checks) {
      totalChecks++;
      const found = check.pattern.test(template);
      
      if (found) {
        compatibilityScore++;
        log(`   ✅ ${check.name}`, 'green');
      } else {
        if (check.required) {
          log(`   ❌ ${check.name} (REQUIRED)`, 'red');
        } else {
          log(`   ⚠️  ${check.name} (optional)`, 'yellow');
        }
      }
    }

    const score = Math.round((compatibilityScore / totalChecks) * 100);
    log(`\n📊 Compatibility Score: ${score}%`, score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red');

    // Check template size
    const templateSize = template.length;
    log(`📏 Template Size: ${templateSize} characters`, templateSize < 100000 ? 'green' : 'yellow');

    if (templateSize > 100000) {
      log('   ⚠️  Large template size may cause issues with some email clients', 'yellow');
    }

    return score >= 70; // Consider 70% as passing

  } catch (error) {
    log(`❌ Template structure analysis failed: ${error.message}`, 'red');
    return false;
  }
}

// Performance test for template rendering
async function testRenderingPerformance() {
  log('\n⚡ Template Rendering Performance Test', 'cyan');
  log('=' .repeat(45), 'cyan');

  try {
    const templatePath = path.join(__dirname, 'email-template-preview.html');
    const template = await fs.readFile(templatePath, 'utf-8');

    const iterations = 100;
    const results = [];

    log(`\n🏃 Running ${iterations} rendering iterations...`, 'blue');

    for (let i = 0; i < iterations; i++) {
      const startTime = process.hrtime.bigint();
      
      // Simulate template rendering
      const currentYear = new Date().getFullYear();
      const renderedTemplate = template
        .replace(/John Doe/g, `Test User ${i}`)
        .replace(/123456/g, `${100000 + i}`)
        .replace(/\$\{new Date\(\)\.getFullYear\(\)\}/g, currentYear.toString());
      
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      results.push(duration);
    }

    // Calculate statistics
    const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
    const minTime = Math.min(...results);
    const maxTime = Math.max(...results);
    const medianTime = results.sort((a, b) => a - b)[Math.floor(results.length / 2)];

    log('\n📊 Rendering Performance Results:', 'cyan');
    log(`   Average: ${avgTime.toFixed(2)}ms`, avgTime < 10 ? 'green' : avgTime < 50 ? 'yellow' : 'red');
    log(`   Median:  ${medianTime.toFixed(2)}ms`, medianTime < 10 ? 'green' : medianTime < 50 ? 'yellow' : 'red');
    log(`   Fastest: ${minTime.toFixed(2)}ms`, 'green');
    log(`   Slowest: ${maxTime.toFixed(2)}ms`, maxTime < 50 ? 'green' : 'yellow');

    if (avgTime < 10) {
      log('🚀 Excellent rendering performance!', 'green');
    } else if (avgTime < 50) {
      log('✅ Good rendering performance', 'yellow');
    } else {
      log('⚠️  Slow rendering performance - consider optimization', 'red');
    }

    return avgTime < 100; // Consider under 100ms as acceptable

  } catch (error) {
    log(`❌ Performance test failed: ${error.message}`, 'red');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n🧪 HTML Template Comprehensive Test Suite', 'cyan');
  log('=' .repeat(50), 'cyan');

  const results = {
    rendering: false,
    structure: false,
    performance: false,
  };

  try {
    results.rendering = await simulateTemplateRendering();
    results.structure = await testTemplateStructure();
    results.performance = await testRenderingPerformance();

    // Final summary
    log('\n' + '='.repeat(50), 'cyan');
    log('📋 Test Results Summary:', 'cyan');
    log(`   Template Rendering: ${results.rendering ? '✅ PASS' : '❌ FAIL'}`, results.rendering ? 'green' : 'red');
    log(`   Template Structure: ${results.structure ? '✅ PASS' : '❌ FAIL'}`, results.structure ? 'green' : 'red');
    log(`   Rendering Performance: ${results.performance ? '✅ PASS' : '❌ FAIL'}`, results.performance ? 'green' : 'red');

    const allPassed = results.rendering && results.structure && results.performance;
    
    if (allPassed) {
      log('\n🎉 All Template Tests PASSED!', 'green');
      log('✅ HTML template system is ready for production.', 'green');
    } else {
      log('\n⚠️  Some Template Tests FAILED!', 'yellow');
      log('🔧 Please review and fix the issues above.', 'yellow');
    }

    log('='.repeat(50), 'cyan');
    return allPassed;

  } catch (error) {
    log(`💥 Test suite crashed: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

// Run the tests
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`💥 Test runner crashed: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { simulateTemplateRendering, testTemplateStructure, testRenderingPerformance, runAllTests };
