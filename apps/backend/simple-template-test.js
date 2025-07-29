#!/usr/bin/env node

/**
 * Simple test to verify email templates are working
 */

const path = require('path');
const fs = require('fs').promises;

async function testTemplates() {
  console.log('🧪 Simple Email Template Test');
  console.log('=' .repeat(40));

  try {
    // Test 1: Find template file
    console.log('\n📋 Test 1: Template File Location');
    
    const possiblePaths = [
      path.join(__dirname, 'src', 'templates', 'emails', 'user-activation-mail.ejs'),
      path.join(process.cwd(), 'src', 'templates', 'emails', 'user-activation-mail.ejs'),
    ];

    let templatePath = null;
    for (const possiblePath of possiblePaths) {
      try {
        await fs.access(possiblePath);
        templatePath = possiblePath;
        console.log(`✅ Template found: ${possiblePath}`);
        break;
      } catch {
        console.log(`❌ Not found: ${possiblePath}`);
      }
    }

    if (!templatePath) {
      console.log('❌ Template file not found');
      return false;
    }

    // Test 2: Read and validate template
    console.log('\n📋 Test 2: Template Content');
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    
    const hasNameVar = templateContent.includes('<%= name %>');
    const hasOtpVar = templateContent.includes('<%= otp %>');
    const hasVerifyContent = templateContent.toLowerCase().includes('verify');
    
    console.log(`✅ Template size: ${templateContent.length} characters`);
    console.log(`${hasNameVar ? '✅' : '❌'} Contains name variable: <%= name %>`);
    console.log(`${hasOtpVar ? '✅' : '❌'} Contains OTP variable: <%= otp %>`);
    console.log(`${hasVerifyContent ? '✅' : '❌'} Contains verification content`);

    if (!hasNameVar || !hasOtpVar || !hasVerifyContent) {
      console.log('❌ Template validation failed');
      return false;
    }

    // Test 3: Basic EJS rendering
    console.log('\n📋 Test 3: EJS Rendering');
    try {
      const ejs = require('ejs');
      
      const testData = {
        name: 'John Doe',
        otp: '123456',
        process: { env: process.env }
      };

      const rendered = ejs.render(templateContent, testData);
      
      const hasRenderedName = rendered.includes('John Doe');
      const hasRenderedOtp = rendered.includes('123456');
      
      console.log(`${hasRenderedName ? '✅' : '❌'} Name rendered correctly`);
      console.log(`${hasRenderedOtp ? '✅' : '❌'} OTP rendered correctly`);
      console.log(`✅ Rendered email size: ${rendered.length} characters`);

      if (hasRenderedName && hasRenderedOtp) {
        // Save test output
        const outputPath = path.join(__dirname, 'template-test-output.html');
        await fs.writeFile(outputPath, rendered);
        console.log(`📄 Test output saved: ${outputPath}`);
        
        console.log('\n' + '=' .repeat(40));
        console.log('🎉 All template tests passed!');
        console.log('\n💡 Template system is working correctly:');
        console.log('   • Template file found and readable');
        console.log('   • EJS variables render properly');
        console.log('   • Enhanced email system should work');
        
        return true;
      } else {
        console.log('❌ Rendering validation failed');
        return false;
      }
      
    } catch (ejsError) {
      console.error('❌ EJS rendering failed:', ejsError.message);
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run test
testTemplates().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Test execution failed:', error);
  process.exit(1);
});
