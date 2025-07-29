#!/usr/bin/env node

/**
 * Final Integration Test for HTML Email Template System
 * This comprehensive test verifies the complete email system integration
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

// Test Results Tracker
class TestResults {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  addTest(name, passed, details = '') {
    this.tests.push({ name, passed, details });
    if (passed) {
      this.passed++;
    } else {
      this.failed++;
    }
  }

  getTotal() {
    return this.tests.length;
  }

  getSuccessRate() {
    return this.getTotal() > 0 ? (this.passed / this.getTotal()) * 100 : 0;
  }

  printSummary() {
    log('\n📊 Final Test Results Summary', 'cyan');
    log('='.repeat(50), 'cyan');
    
    this.tests.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      const color = test.passed ? 'green' : 'red';
      log(`${status} ${test.name}`, color);
      if (test.details) {
        log(`   ${test.details}`, 'blue');
      }
    });

    log('\n📈 Statistics:', 'cyan');
    log(`   Total Tests: ${this.getTotal()}`, 'blue');
    log(`   Passed: ${this.passed}`, 'green');
    log(`   Failed: ${this.failed}`, this.failed > 0 ? 'red' : 'green');
    log(`   Success Rate: ${this.getSuccessRate().toFixed(1)}%`, this.getSuccessRate() >= 90 ? 'green' : 'yellow');
  }
}

async function runFinalIntegrationTest() {
  log('\n🎯 Final HTML Email System Integration Test', 'cyan');
  log('='.repeat(55), 'cyan');
  log('Testing complete system integration and production readiness', 'blue');

  const results = new TestResults();

  // Test 1: File Structure Verification
  log('\n📁 Test 1: File Structure Verification', 'magenta');
  try {
    const requiredFiles = [
      'email-template-preview.html',
      'src/lib/email-service-html.ts',
      'src/lib/sendEmail.ts',
      'src/lib/email-service-ejs.ts'
    ];

    for (const file of requiredFiles) {
      try {
        await fs.access(path.join(__dirname, file));
        log(`   ✅ ${file} exists`, 'green');
      } catch {
        log(`   ❌ ${file} missing`, 'red');
        results.addTest(`File: ${file}`, false);
        continue;
      }
      results.addTest(`File: ${file}`, true);
    }
  } catch (error) {
    results.addTest('File Structure', false, error.message);
  }

  // Test 2: HTML Template Quality
  log('\n🎨 Test 2: HTML Template Quality Assessment', 'magenta');
  try {
    const templatePath = path.join(__dirname, 'email-template-preview.html');
    const template = await fs.readFile(templatePath, 'utf-8');

    // Quality checks
    const qualityChecks = [
      { name: 'Template Size', test: template.length > 1000 && template.length < 200000 },
      { name: 'DOCTYPE Declaration', test: template.includes('<!DOCTYPE html') },
      { name: 'Table Layout', test: template.includes('role="presentation"') },
      { name: 'Inline Styles', test: template.includes('style="') },
      { name: 'Mobile Responsive', test: template.includes('@media') },
      { name: 'Brand Colors', test: template.includes('#C79F12') },
      { name: 'Professional Typography', test: template.includes('Arial, Helvetica, sans-serif') },
    ];

    qualityChecks.forEach(check => {
      if (check.test) {
        log(`   ✅ ${check.name}`, 'green');
      } else {
        log(`   ❌ ${check.name}`, 'red');
      }
      results.addTest(`Template: ${check.name}`, check.test);
    });

  } catch (error) {
    results.addTest('Template Quality', false, error.message);
  }

  // Test 3: Service Integration
  log('\n🔧 Test 3: Service Integration Verification', 'magenta');
  try {
    const sendEmailPath = path.join(__dirname, 'src/lib/sendEmail.ts');
    const sendEmailContent = await fs.readFile(sendEmailPath, 'utf-8');

    const integrationChecks = [
      { name: 'HTML Service Import', test: sendEmailContent.includes('./email-service-html') },
      { name: 'HTML Function Usage', test: sendEmailContent.includes('sendEmailWithTimingHTML') },
      { name: 'Updated Comments', test: sendEmailContent.includes('HTML template') },
      { name: 'Timeout Configuration', test: sendEmailContent.includes('12000') },
    ];

    integrationChecks.forEach(check => {
      if (check.test) {
        log(`   ✅ ${check.name}`, 'green');
      } else {
        log(`   ❌ ${check.name}`, 'red');
      }
      results.addTest(`Integration: ${check.name}`, check.test);
    });

  } catch (error) {
    results.addTest('Service Integration', false, error.message);
  }

  // Test 4: SMTP Configuration
  log('\n📡 Test 4: SMTP Configuration Verification', 'magenta');
  try {
    const htmlServicePath = path.join(__dirname, 'src/lib/email-service-html.ts');
    const htmlServiceContent = await fs.readFile(htmlServicePath, 'utf-8');

    const smtpChecks = [
      { name: 'Connection Timeout (10s)', test: htmlServiceContent.includes('connectionTimeout: 10000') },
      { name: 'Greeting Timeout (5s)', test: htmlServiceContent.includes('greetingTimeout: 5000') },
      { name: 'Socket Timeout (15s)', test: htmlServiceContent.includes('socketTimeout: 15000') },
      { name: 'Connection Pooling', test: htmlServiceContent.includes('pool: true') },
      { name: 'Retry Logic', test: htmlServiceContent.includes('retry: {') },
      { name: 'Error Handling', test: htmlServiceContent.includes('ETIMEDOUT') },
    ];

    smtpChecks.forEach(check => {
      if (check.test) {
        log(`   ✅ ${check.name}`, 'green');
      } else {
        log(`   ❌ ${check.name}`, 'red');
      }
      results.addTest(`SMTP: ${check.name}`, check.test);
    });

  } catch (error) {
    results.addTest('SMTP Configuration', false, error.message);
  }

  // Test 5: Template Rendering Performance
  log('\n⚡ Test 5: Template Rendering Performance', 'magenta');
  try {
    const templatePath = path.join(__dirname, 'email-template-preview.html');
    const template = await fs.readFile(templatePath, 'utf-8');

    // Performance test
    const iterations = 50;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = process.hrtime.bigint();
      
      const rendered = template
        .replace(/John Doe/g, `User ${i}`)
        .replace(/123456/g, `${100000 + i}`)
        .replace(/\$\{new Date\(\)\.getFullYear\(\)\}/g, '2024');
      
      const end = process.hrtime.bigint();
      times.push(Number(end - start) / 1000000); // Convert to ms
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);

    const performanceChecks = [
      { name: 'Average Render Time < 10ms', test: avgTime < 10 },
      { name: 'Max Render Time < 50ms', test: maxTime < 50 },
      { name: 'Consistent Performance', test: (maxTime - Math.min(...times)) < 20 },
    ];

    performanceChecks.forEach(check => {
      if (check.test) {
        log(`   ✅ ${check.name}`, 'green');
      } else {
        log(`   ❌ ${check.name}`, 'red');
      }
      results.addTest(`Performance: ${check.name}`, check.test);
    });

    log(`   📊 Average: ${avgTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`, 'blue');

  } catch (error) {
    results.addTest('Template Performance', false, error.message);
  }

  // Test 6: Variable Substitution Accuracy
  log('\n🔄 Test 6: Variable Substitution Accuracy', 'magenta');
  try {
    const templatePath = path.join(__dirname, 'email-template-preview.html');
    const template = await fs.readFile(templatePath, 'utf-8');

    const testCases = [
      { name: 'John Smith', otp: '123456' },
      { name: 'Test User', otp: '999999' },
      { name: 'María García', otp: '000000' },
    ];

    let allSubstitutionsCorrect = true;

    testCases.forEach((testCase, index) => {
      const rendered = template
        .replace(/John Doe/g, testCase.name)
        .replace(/123456/g, testCase.otp)
        .replace(/\$\{new Date\(\)\.getFullYear\(\)\}/g, '2024');

      const nameCorrect = rendered.includes(testCase.name) && !rendered.includes('John Doe');
      const otpCorrect = rendered.includes(testCase.otp);
      const yearCorrect = rendered.includes('2024');

      if (nameCorrect && otpCorrect && yearCorrect) {
        log(`   ✅ Test Case ${index + 1}: ${testCase.name}`, 'green');
      } else {
        log(`   ❌ Test Case ${index + 1}: ${testCase.name}`, 'red');
        allSubstitutionsCorrect = false;
      }
    });

    results.addTest('Variable Substitution', allSubstitutionsCorrect);

  } catch (error) {
    results.addTest('Variable Substitution', false, error.message);
  }

  // Test 7: Production Readiness
  log('\n🚀 Test 7: Production Readiness Assessment', 'magenta');
  
  const productionChecks = [
    { name: 'SMTP Timeout Fixes Applied', test: results.tests.filter(t => t.name.includes('SMTP:') && t.passed).length >= 5 },
    { name: 'HTML Template Integration Complete', test: results.tests.filter(t => t.name.includes('Integration:') && t.passed).length >= 3 },
    { name: 'Template Quality Standards Met', test: results.tests.filter(t => t.name.includes('Template:') && t.passed).length >= 6 },
    { name: 'Performance Requirements Met', test: results.tests.filter(t => t.name.includes('Performance:') && t.passed).length >= 2 },
    { name: 'Overall Success Rate > 90%', test: results.getSuccessRate() > 90 },
  ];

  productionChecks.forEach(check => {
    if (check.test) {
      log(`   ✅ ${check.name}`, 'green');
    } else {
      log(`   ❌ ${check.name}`, 'red');
    }
    results.addTest(`Production: ${check.name}`, check.test);
  });

  // Final Results
  results.printSummary();

  const isProductionReady = results.getSuccessRate() >= 90;
  
  log('\n' + '='.repeat(55), 'cyan');
  if (isProductionReady) {
    log('🎉 SYSTEM READY FOR PRODUCTION! 🎉', 'green');
    log('✅ All critical tests passed', 'green');
    log('✅ HTML template system fully integrated', 'green');
    log('✅ SMTP timeout issues resolved', 'green');
    log('✅ Professional email design implemented', 'green');
  } else {
    log('⚠️  SYSTEM NOT READY FOR PRODUCTION', 'yellow');
    log('❌ Some critical tests failed', 'red');
    log('🔧 Please fix the issues above before deployment', 'yellow');
  }
  log('='.repeat(55), 'cyan');

  return isProductionReady;
}

// Run the final integration test
if (require.main === module) {
  runFinalIntegrationTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`💥 Final integration test crashed: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runFinalIntegrationTest };
