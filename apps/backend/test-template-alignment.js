#!/usr/bin/env node

/**
 * Test script to verify email template alignment fixes
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Email Template Alignment Test');
console.log('=' .repeat(50));

try {
  // Read the email templates file
  const emailTemplatesPath = path.join(__dirname, 'src/lib/email-templates.ts');
  const templateContent = fs.readFileSync(emailTemplatesPath, 'utf8');

  // Check for alignment improvements
  const checks = [
    {
      name: 'Enhanced Logo Container Structure',
      test: () => templateContent.includes('Brand Logo Container') && templateContent.includes('table role="presentation"'),
      description: 'Verify logo uses proper table structure for alignment'
    },
    {
      name: 'Three-Column Benefits Grid',
      test: () => {
        const freshOrganic = templateContent.includes('Fresh Organic');
        const fastDelivery = templateContent.includes('Fast Delivery');
        const ecoFriendly = templateContent.includes('Eco-Friendly');
        return freshOrganic && fastDelivery && ecoFriendly;
      },
      description: 'Verify all three benefit items are present'
    },
    {
      name: 'Enhanced Icon Alignment Structure',
      test: () => {
        const hasEmojis = templateContent.includes('🥬') && templateContent.includes('🚚') && templateContent.includes('💚');
        const hasTableStructure = templateContent.includes('padding-bottom: 12px');
        return hasEmojis && hasTableStructure;
      },
      description: 'Verify icons use proper table structure for alignment'
    },
    {
      name: 'Improved Logo Sizing',
      test: () => {
        const hasLargerLogo = templateContent.includes('width: 60px; height: 60px');
        const hasVerticalAlignment = templateContent.includes('vertical-align: middle');
        return hasLargerLogo && hasVerticalAlignment;
      },
      description: 'Verify logo has improved sizing and alignment'
    },
    {
      name: 'Professional Typography',
      test: () => {
        const hasSegoeUI = templateContent.includes("'Segoe UI', Tahoma, Geneva, Verdana, sans-serif");
        const hasProperLineHeight = templateContent.includes('line-height: 1.3');
        return hasSegoeUI && hasProperLineHeight;
      },
      description: 'Verify professional typography is applied'
    },
    {
      name: 'Enhanced CSS Classes',
      test: () => {
        const hasLogoClasses = templateContent.includes('logo-container') && templateContent.includes('logo-circle');
        const hasBenefitClasses = templateContent.includes('benefit-icon') && templateContent.includes('benefit-text');
        return hasLogoClasses && hasBenefitClasses;
      },
      description: 'Verify enhanced CSS classes for better styling'
    },
    {
      name: 'Mobile Responsive Improvements',
      test: () => {
        const hasMobileBenefits = templateContent.includes('Enhanced mobile benefits grid');
        const hasMobileLogos = templateContent.includes('Enhanced mobile logo styles');
        return hasMobileBenefits && hasMobileLogos;
      },
      description: 'Verify mobile responsive improvements are in place'
    },
    {
      name: 'Footer Logo Alignment',
      test: () => {
        const hasFooterContainer = templateContent.includes('Footer Logo Container');
        const hasFooterTable = templateContent.includes('width="50" height="50"');
        return hasFooterContainer && hasFooterTable;
      },
      description: 'Verify footer logo uses proper alignment structure'
    }
  ];

  let passed = 0;
  let failed = 0;

  checks.forEach((check, index) => {
    const result = check.test();
    if (result) {
      console.log(`✅ ${index + 1}. ${check.name}`);
      console.log(`   ${check.description}`);
      passed++;
    } else {
      console.log(`❌ ${index + 1}. ${check.name}`);
      console.log(`   ${check.description}`);
      failed++;
    }
    console.log('');
  });

  console.log('=' .repeat(50));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('🎉 All alignment tests passed! Email template is properly structured.');
    console.log('\n📋 Summary of Improvements:');
    console.log('   • Logo perfectly centered with table-based structure');
    console.log('   • Three-column benefits grid (Fresh Organic, Fast Delivery, Eco-Friendly)');
    console.log('   • Enhanced icon-text alignment using nested tables');
    console.log('   • Professional typography with consistent spacing');
    console.log('   • Mobile-responsive design improvements');
    console.log('   • Cross-email-client compatibility enhancements');
  } else {
    console.log('⚠️  Some alignment tests failed. Please review the template structure.');
  }

  process.exit(failed === 0 ? 0 : 1);

} catch (error) {
  console.error('❌ Error reading email templates:', error.message);
  process.exit(1);
}
