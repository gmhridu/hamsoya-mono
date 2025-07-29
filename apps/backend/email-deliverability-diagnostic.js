#!/usr/bin/env node

/**
 * Email Deliverability Diagnostic Tool
 * Comprehensive tool to diagnose email delivery issues and SMTP configuration problems
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const dns = require('dns').promises;

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

class EmailDeliverabilityDiagnostic {
  constructor() {
    this.results = {
      smtpConfig: { passed: 0, failed: 0, tests: [] },
      authentication: { passed: 0, failed: 0, tests: [] },
      deliverability: { passed: 0, failed: 0, tests: [] },
      dnsRecords: { passed: 0, failed: 0, tests: [] },
    };
  }

  addResult(category, testName, passed, details = '') {
    this.results[category].tests.push({ name: testName, passed, details });
    if (passed) {
      this.results[category].passed++;
    } else {
      this.results[category].failed++;
    }
  }

  // Test 1: SMTP Configuration Validation
  async testSMTPConfiguration() {
    log('\n🔧 Test 1: SMTP Configuration Validation', 'cyan');
    log('='.repeat(50), 'cyan');

    const requiredEnvVars = [
      'SMTP_HOST',
      'SMTP_PORT',
      'SMTP_SERVICE',
      'SMTP_USER',
      'SMTP_PASSWORD',
    ];

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar];
      if (value) {
        log(`✅ ${envVar}: ${envVar === 'SMTP_PASSWORD' ? '***' : value}`, 'green');
        this.addResult('smtpConfig', envVar, true, value);
      } else {
        log(`❌ ${envVar}: Not set`, 'red');
        this.addResult('smtpConfig', envVar, false, 'Missing environment variable');
      }
    }

    // Validate specific configuration values
    const port = parseInt(process.env.SMTP_PORT);
    const isValidPort = port === 465 || port === 587 || port === 25;
    if (isValidPort) {
      log(`✅ SMTP Port ${port} is valid for Gmail`, 'green');
      this.addResult('smtpConfig', 'Valid Port', true, `Port ${port}`);
    } else {
      log(`❌ SMTP Port ${port} may not work with Gmail (recommended: 465 or 587)`, 'red');
      this.addResult('smtpConfig', 'Valid Port', false, `Invalid port ${port}`);
    }

    // Check if using Gmail service
    const isGmailService =
      process.env.SMTP_SERVICE === 'gmail' && process.env.SMTP_HOST === 'smtp.gmail.com';
    if (isGmailService) {
      log('✅ Gmail SMTP service configuration is correct', 'green');
      this.addResult('smtpConfig', 'Gmail Service', true, 'Correct Gmail configuration');
    } else {
      log('⚠️  SMTP configuration may not be optimized for Gmail', 'yellow');
      this.addResult('smtpConfig', 'Gmail Service', false, 'Non-standard Gmail configuration');
    }
  }

  // Test 2: SMTP Connection and Authentication
  async testSMTPAuthentication() {
    log('\n🔐 Test 2: SMTP Connection and Authentication', 'cyan');
    log('='.repeat(50), 'cyan');

    try {
      const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE,
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        // Enhanced debugging
        debug: true,
        logger: true,
      });

      log('🔄 Testing SMTP connection...', 'blue');
      const connectionStart = Date.now();

      await transporter.verify();
      const connectionTime = Date.now() - connectionStart;

      log(`✅ SMTP connection successful (${connectionTime}ms)`, 'green');
      this.addResult('authentication', 'SMTP Connection', true, `Connected in ${connectionTime}ms`);

      // Test authentication specifically
      log('🔄 Testing SMTP authentication...', 'blue');
      const authTest = await new Promise(resolve => {
        transporter.verify((error, success) => {
          if (error) {
            resolve({ success: false, error: error.message });
          } else {
            resolve({ success: true, info: 'Authentication successful' });
          }
        });
      });

      if (authTest.success) {
        log('✅ SMTP authentication successful', 'green');
        this.addResult('authentication', 'SMTP Auth', true, 'Authentication verified');
      } else {
        log(`❌ SMTP authentication failed: ${authTest.error}`, 'red');
        this.addResult('authentication', 'SMTP Auth', false, authTest.error);
      }
    } catch (error) {
      log(`❌ SMTP connection failed: ${error.message}`, 'red');
      this.addResult('authentication', 'SMTP Connection', false, error.message);

      // Provide specific error guidance
      if (error.message.includes('Invalid login')) {
        log('💡 Authentication Error: Check your Gmail App Password', 'yellow');
        log('   - Ensure 2FA is enabled on your Gmail account', 'yellow');
        log('   - Generate a new App Password for "Mail"', 'yellow');
        log('   - Use the App Password, not your regular Gmail password', 'yellow');
      } else if (error.message.includes('ECONNREFUSED')) {
        log('💡 Connection Error: Check network and firewall settings', 'yellow');
        log('   - Verify internet connection', 'yellow');
        log('   - Check if port 465/587 is blocked by firewall', 'yellow');
      }
    }
  }

  // Test 3: DNS Records and Domain Reputation
  async testDNSRecords() {
    log('\n🌐 Test 3: DNS Records and Domain Reputation', 'cyan');
    log('='.repeat(50), 'cyan');

    const senderEmail = process.env.SMTP_USER;
    const domain = senderEmail.split('@')[1];

    try {
      // Check MX records
      log(`🔄 Checking MX records for ${domain}...`, 'blue');
      const mxRecords = await dns.resolveMx(domain);
      if (mxRecords && mxRecords.length > 0) {
        log(`✅ MX records found for ${domain}:`, 'green');
        mxRecords.forEach(mx => {
          log(`   - ${mx.exchange} (priority: ${mx.priority})`, 'blue');
        });
        this.addResult('dnsRecords', 'MX Records', true, `${mxRecords.length} MX records found`);
      } else {
        log(`❌ No MX records found for ${domain}`, 'red');
        this.addResult('dnsRecords', 'MX Records', false, 'No MX records');
      }

      // Check SPF records
      log(`🔄 Checking SPF records for ${domain}...`, 'blue');
      try {
        const txtRecords = await dns.resolveTxt(domain);
        const spfRecord = txtRecords.find(record => record.some(txt => txt.startsWith('v=spf1')));

        if (spfRecord) {
          log(`✅ SPF record found: ${spfRecord.join('')}`, 'green');
          this.addResult('dnsRecords', 'SPF Record', true, spfRecord.join(''));

          // Check if Gmail is included in SPF
          const spfText = spfRecord.join('');
          if (
            spfText.includes('include:_spf.google.com') ||
            spfText.includes('include:gmail.com')
          ) {
            log('✅ SPF record includes Gmail servers', 'green');
            this.addResult('dnsRecords', 'SPF Gmail Include', true, 'Gmail included in SPF');
          } else {
            log('⚠️  SPF record may not include Gmail servers', 'yellow');
            this.addResult(
              'dnsRecords',
              'SPF Gmail Include',
              false,
              'Gmail not explicitly included'
            );
          }
        } else {
          log(`⚠️  No SPF record found for ${domain}`, 'yellow');
          this.addResult('dnsRecords', 'SPF Record', false, 'No SPF record found');
        }
      } catch (error) {
        log(`❌ Error checking SPF records: ${error.message}`, 'red');
        this.addResult('dnsRecords', 'SPF Record', false, error.message);
      }

      // Check DKIM records (basic check)
      log(`🔄 Checking for DKIM records...`, 'blue');
      try {
        // Common DKIM selectors for Gmail
        const dkimSelectors = ['google', 'gmail', 'default'];
        let dkimFound = false;

        for (const selector of dkimSelectors) {
          try {
            const dkimDomain = `${selector}._domainkey.${domain}`;
            const dkimRecords = await dns.resolveTxt(dkimDomain);
            if (dkimRecords && dkimRecords.length > 0) {
              log(`✅ DKIM record found for selector '${selector}'`, 'green');
              dkimFound = true;
              break;
            }
          } catch (e) {
            // Continue checking other selectors
          }
        }

        if (dkimFound) {
          this.addResult('dnsRecords', 'DKIM Record', true, 'DKIM record found');
        } else {
          log('⚠️  No DKIM records found (may be managed by Gmail)', 'yellow');
          this.addResult('dnsRecords', 'DKIM Record', false, 'No DKIM records found');
        }
      } catch (error) {
        log(`❌ Error checking DKIM records: ${error.message}`, 'red');
        this.addResult('dnsRecords', 'DKIM Record', false, error.message);
      }
    } catch (error) {
      log(`❌ DNS lookup failed: ${error.message}`, 'red');
      this.addResult('dnsRecords', 'DNS Lookup', false, error.message);
    }
  }

  // Test 4: Email Content and Deliverability Factors
  async testEmailContent() {
    log('\n📧 Test 4: Email Content and Deliverability Analysis', 'cyan');
    log('='.repeat(50), 'cyan');

    try {
      const fs = require('fs').promises;
      const path = require('path');

      // Load the HTML template
      const templatePath = path.join(__dirname, 'email-template-preview.html');
      const template = await fs.readFile(templatePath, 'utf-8');

      // Render with test data
      const testHtml = template
        .replace(/John Doe/g, 'Test User')
        .replace(/123456/g, '987654')
        .replace(/\$\{new Date\(\)\.getFullYear\(\)\}/g, '2024');

      // Content analysis
      const contentChecks = [
        {
          name: 'HTML Size',
          test: testHtml.length < 100000,
          details: `${testHtml.length} characters (recommended: <100KB)`,
        },
        {
          name: 'No Suspicious Keywords',
          test: !/(free|urgent|act now|limited time|click here|guarantee)/i.test(testHtml),
          details: 'Checked for common spam trigger words',
        },
        {
          name: 'Proper HTML Structure',
          test: testHtml.includes('<!DOCTYPE html') && testHtml.includes('</html>'),
          details: 'Valid HTML document structure',
        },
        {
          name: 'No External Images',
          test: !testHtml.includes('http://') && !testHtml.includes('https://'),
          details: 'All content is inline (better deliverability)',
        },
        {
          name: 'Text-to-HTML Ratio',
          test: testHtml.replace(/<[^>]*>/g, '').length / testHtml.length > 0.1,
          details: 'Good balance of text content vs HTML markup',
        },
        {
          name: 'Professional Subject Line',
          test:
            !'Verify Your Email - Hamsoya'.includes('!') &&
            'Verify Your Email - Hamsoya'.length < 50,
          details: 'Subject line is professional and concise',
        },
      ];

      contentChecks.forEach(check => {
        if (check.test) {
          log(`✅ ${check.name}: ${check.details}`, 'green');
          this.addResult('deliverability', check.name, true, check.details);
        } else {
          log(`❌ ${check.name}: ${check.details}`, 'red');
          this.addResult('deliverability', check.name, false, check.details);
        }
      });
    } catch (error) {
      log(`❌ Error analyzing email content: ${error.message}`, 'red');
      this.addResult('deliverability', 'Content Analysis', false, error.message);
    }
  }

  // Test 5: Send Test Email with Enhanced Logging
  async sendTestEmail(testRecipient) {
    log('\n📤 Test 5: Send Test Email with Enhanced Logging', 'cyan');
    log('='.repeat(50), 'cyan');

    try {
      // Import the HTML email service
      const { sendEmailWithHTML } = require('./src/lib/email-service-html');

      log(`📧 Sending test email to: ${testRecipient}`, 'blue');
      log('🔄 This will show detailed SMTP responses...', 'blue');

      const startTime = Date.now();

      await sendEmailWithHTML({
        to: testRecipient,
        subject: 'Hamsoya Email Deliverability Test',
        data: {
          name: 'Test User',
          otp: '123456',
        },
      });

      const duration = Date.now() - startTime;

      log(`✅ Test email sent successfully in ${duration}ms`, 'green');
      log('📋 Check the console output above for detailed SMTP responses', 'blue');
      log("📬 Please check the recipient's inbox AND spam folder", 'yellow');

      this.addResult('deliverability', 'Test Email Send', true, `Sent in ${duration}ms`);
    } catch (error) {
      log(`❌ Test email failed: ${error.message}`, 'red');
      this.addResult('deliverability', 'Test Email Send', false, error.message);
    }
  }

  // Generate comprehensive report
  generateReport() {
    log('\n📊 Email Deliverability Diagnostic Report', 'cyan');
    log('='.repeat(60), 'cyan');

    const categories = ['smtpConfig', 'authentication', 'deliverability', 'dnsRecords'];
    let totalPassed = 0;
    let totalTests = 0;

    categories.forEach(category => {
      const result = this.results[category];
      const categoryName = category
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());

      log(`\n📋 ${categoryName}:`, 'magenta');
      log(
        `   Passed: ${result.passed}/${result.passed + result.failed}`,
        result.failed === 0 ? 'green' : 'yellow'
      );

      totalPassed += result.passed;
      totalTests += result.passed + result.failed;

      if (result.failed > 0) {
        log('   Failed tests:', 'red');
        result.tests
          .filter(t => !t.passed)
          .forEach(test => {
            log(`   - ${test.name}: ${test.details}`, 'red');
          });
      }
    });

    const successRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

    log('\n📈 Overall Results:', 'cyan');
    log(`   Total Tests: ${totalTests}`, 'blue');
    log(`   Passed: ${totalPassed}`, 'green');
    log(`   Failed: ${totalTests - totalPassed}`, totalTests - totalPassed > 0 ? 'red' : 'green');
    log(`   Success Rate: ${successRate.toFixed(1)}%`, successRate >= 80 ? 'green' : 'yellow');

    // Recommendations
    log('\n💡 Recommendations:', 'cyan');
    if (successRate >= 90) {
      log('✅ Email system is well configured for deliverability', 'green');
      log('🔍 If emails are still not being received, check:', 'blue');
      log("   - Recipient's spam/junk folder", 'blue');
      log('   - Gmail\'s "Promotions" or "Updates" tabs', 'blue');
      log("   - Recipient's email filters and rules", 'blue');
    } else {
      log('⚠️  Email deliverability issues detected. Priority fixes:', 'yellow');

      if (this.results.authentication.failed > 0) {
        log('   1. Fix SMTP authentication issues first', 'red');
      }
      if (this.results.dnsRecords.failed > 2) {
        log('   2. Configure proper DNS records (SPF, DKIM)', 'red');
      }
      if (this.results.deliverability.failed > 0) {
        log('   3. Optimize email content and headers', 'red');
      }
    }

    return successRate >= 80;
  }
}

// Main diagnostic function
async function runEmailDeliverabilityDiagnostic() {
  log('🔍 Email Deliverability Diagnostic Tool', 'cyan');
  log('='.repeat(60), 'cyan');
  log('This tool will comprehensively test your email delivery setup\n', 'blue');

  const diagnostic = new EmailDeliverabilityDiagnostic();

  try {
    await diagnostic.testSMTPConfiguration();
    await diagnostic.testSMTPAuthentication();
    await diagnostic.testDNSRecords();
    await diagnostic.testEmailContent();

    // Test with the problematic email address
    const testEmail = 'seulybegum53@gmail.com';
    await diagnostic.sendTestEmail(testEmail);

    const success = diagnostic.generateReport();

    log('\n' + '='.repeat(60), 'cyan');
    if (success) {
      log('🎉 Email system diagnostic completed successfully!', 'green');
    } else {
      log('⚠️  Email system has deliverability issues that need attention.', 'yellow');
    }
    log('='.repeat(60), 'cyan');

    return success;
  } catch (error) {
    log(`💥 Diagnostic failed: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

// Run the diagnostic
if (require.main === module) {
  runEmailDeliverabilityDiagnostic()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`💥 Diagnostic crashed: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runEmailDeliverabilityDiagnostic, EmailDeliverabilityDiagnostic };
