#!/usr/bin/env node

/**
 * Test script to verify email templates are working correctly
 */

const path = require('path');

async function testEmailTemplates() {
  console.log('🧪 Testing Email Template System');
  console.log('='.repeat(50));

  const fs = require('fs').promises;

  try {
    // Test 1: Check if template files exist
    console.log('\n📋 Test 1: Template File Existence');

    const possiblePaths = [
      path.join(process.cwd(), 'src', 'templates', 'emails', 'user-activation-mail.ejs'),
      path.join(
        process.cwd(),
        'apps',
        'backend',
        'src',
        'templates',
        'emails',
        'user-activation-mail.ejs'
      ),
      path.join(__dirname, 'src', 'templates', 'emails', 'user-activation-mail.ejs'),
    ];

    let templatePath = null;
    for (const possiblePath of possiblePaths) {
      try {
        await fs.access(possiblePath);
        templatePath = possiblePath;
        console.log(`✅ Template found: ${possiblePath}`);
        break;
      } catch {
        console.log(`❌ Template not found: ${possiblePath}`);
      }
    }

    if (!templatePath) {
      console.log('❌ user-activation-mail.ejs template not found in any location');
      return false;
    }

    // Test 2: List available templates
    console.log('\n📋 Test 2: Available Templates');
    const templates = await emailService.listEmailTemplates();
    console.log('Available templates:', templates);

    // Test 3: Generate test email
    console.log('\n📋 Test 3: Template Rendering');
    try {
      const testData = {
        name: 'John Doe',
        otp: '123456',
      };

      const renderedEmail = await emailService.generateTestEmailEJS(
        'user-activation-mail',
        testData
      );

      if (renderedEmail && renderedEmail.includes('John Doe') && renderedEmail.includes('123456')) {
        console.log('✅ Template rendered successfully');
        console.log(`📄 Email length: ${renderedEmail.length} characters`);

        // Save rendered email for inspection
        const fs = require('fs');
        const outputPath = path.join(__dirname, 'test-rendered-email.html');
        fs.writeFileSync(outputPath, renderedEmail);
        console.log(`📄 Rendered email saved to: ${outputPath}`);
      } else {
        console.log('❌ Template rendering failed or missing data');
        return false;
      }
    } catch (renderError) {
      console.error('❌ Template rendering error:', renderError.message);
      return false;
    }

    // Test 4: Performance test
    console.log('\n📋 Test 4: Performance Test');
    const startTime = Date.now();

    for (let i = 0; i < 5; i++) {
      await emailService.generateTestEmailEJS('user-activation-mail', {
        name: `Test User ${i}`,
        otp: `12345${i}`,
      });
    }

    const endTime = Date.now();
    const avgTime = (endTime - startTime) / 5;
    console.log(`✅ Average template rendering time: ${avgTime.toFixed(2)}ms`);

    if (avgTime > 100) {
      console.log('⚠️  Template rendering is slower than expected (>100ms)');
    } else {
      console.log('🚀 Template rendering performance is good (<100ms)');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 All email template tests passed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Templates are working correctly');
    console.log('   2. Enhanced email system should now work without fallback');
    console.log('   3. Email delivery should be faster and more reliable');

    return true;
  } catch (error) {
    console.error('❌ Email template test failed:', error);
    return false;
  }
}

// Run the tests
testEmailTemplates()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
