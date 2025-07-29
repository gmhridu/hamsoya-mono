#!/usr/bin/env node

/**
 * Gmail-Specific Deliverability Checker and Improvement Tool
 * Focuses on Gmail's specific filtering and delivery requirements
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// ANSI color codes
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

class GmailDeliverabilityChecker {
  constructor() {
    this.issues = [];
    this.recommendations = [];
  }

  addIssue(issue, severity = 'medium') {
    this.issues.push({ issue, severity });
  }

  addRecommendation(recommendation) {
    this.recommendations.push(recommendation);
  }

  // Check Gmail-specific deliverability factors
  async checkGmailDeliverability() {
    log('\n🔍 Gmail-Specific Deliverability Analysis', 'cyan');
    log('=' .repeat(60), 'cyan');

    await this.checkSenderReputation();
    await this.checkContentFilters();
    await this.checkAuthenticationRecords();
    await this.checkGmailSpecificFactors();
    await this.testMultipleProviders();
    
    this.generateGmailReport();
    await this.provideSolutions();
  }

  // Check sender reputation factors
  async checkSenderReputation() {
    log('\n📊 Sender Reputation Analysis', 'blue');
    log('-'.repeat(40), 'blue');

    const senderEmail = process.env.SMTP_USER;
    const domain = senderEmail.split('@')[1];

    // Check if using Gmail as sender (common issue)
    if (domain === 'gmail.com') {
      log('⚠️  Using Gmail address as sender', 'yellow');
      this.addIssue('Using Gmail address as sender can trigger spam filters', 'high');
      this.addRecommendation('Consider using a custom domain email address (e.g., noreply@hamsoya.com)');
      
      log('💡 Gmail treats emails from Gmail addresses to Gmail addresses with extra scrutiny', 'yellow');
      log('   This is a major factor in your deliverability issues!', 'yellow');
    } else {
      log(`✅ Using custom domain: ${domain}`, 'green');
    }

    // Check for new domain issues
    log('\n🔄 Checking domain age and reputation...', 'blue');
    log('⚠️  New domains often have deliverability issues with Gmail', 'yellow');
    this.addRecommendation('Gradually increase email volume to build sender reputation');
    this.addRecommendation('Ensure consistent sending patterns and engagement');
  }

  // Check content that might trigger Gmail filters
  async checkContentFilters() {
    log('\n📧 Content Filter Analysis', 'blue');
    log('-'.repeat(40), 'blue');

    try {
      const fs = require('fs').promises;
      const path = require('path');
      
      const templatePath = path.join(__dirname, 'email-template-preview.html');
      const template = await fs.readFile(templatePath, 'utf-8');
      
      // Gmail-specific content checks
      const gmailChecks = [
        {
          name: 'Excessive Styling',
          test: !template.includes('font-size: 0px') && !template.includes('display: none'),
          issue: 'Hidden or zero-sized content can trigger spam filters'
        },
        {
          name: 'Image-to-Text Ratio',
          test: (template.match(/img/gi) || []).length < 3,
          issue: 'Too many images relative to text content'
        },
        {
          name: 'Suspicious Links',
          test: !template.includes('bit.ly') && !template.includes('tinyurl'),
          issue: 'Shortened URLs are often flagged as spam'
        },
        {
          name: 'Professional Language',
          test: !/(urgent|act now|limited time|free|guarantee|winner)/i.test(template),
          issue: 'Promotional language triggers spam filters'
        },
        {
          name: 'Proper Unsubscribe',
          test: template.toLowerCase().includes('unsubscribe') || template.toLowerCase().includes('opt-out'),
          issue: 'Missing unsubscribe option (required for bulk emails)'
        }
      ];

      gmailChecks.forEach(check => {
        if (check.test) {
          log(`✅ ${check.name}: Passed`, 'green');
        } else {
          log(`❌ ${check.name}: ${check.issue}`, 'red');
          this.addIssue(check.issue, 'medium');
        }
      });

    } catch (error) {
      log(`❌ Error analyzing content: ${error.message}`, 'red');
    }
  }

  // Check authentication records
  async checkAuthenticationRecords() {
    log('\n🔐 Email Authentication Analysis', 'blue');
    log('-'.repeat(40), 'blue');

    const senderEmail = process.env.SMTP_USER;
    const domain = senderEmail.split('@')[1];

    if (domain === 'gmail.com') {
      log('✅ Gmail handles SPF/DKIM automatically for Gmail addresses', 'green');
      log('⚠️  But this contributes to deliverability issues when sending to Gmail', 'yellow');
      this.addRecommendation('Switch to custom domain with proper SPF/DKIM setup');
    } else {
      log('⚠️  Custom domain requires proper SPF/DKIM/DMARC setup', 'yellow');
      this.addRecommendation('Ensure SPF record includes Gmail servers: include:_spf.google.com');
      this.addRecommendation('Set up DKIM signing for your domain');
      this.addRecommendation('Configure DMARC policy for domain protection');
    }
  }

  // Check Gmail-specific factors
  async checkGmailSpecificFactors() {
    log('\n📮 Gmail-Specific Factors', 'blue');
    log('-'.repeat(40), 'blue');

    // Check for common Gmail issues
    const gmailFactors = [
      {
        factor: 'Gmail Tab Categorization',
        description: 'Emails might be going to Promotions/Updates tab instead of Primary',
        solution: 'Use more personal, less promotional language and formatting'
      },
      {
        factor: 'Gmail Engagement Tracking',
        description: 'Gmail tracks user engagement (opens, clicks, deletes)',
        solution: 'Encourage recipients to add sender to contacts and move to Primary tab'
      },
      {
        factor: 'Gmail Volume Filtering',
        description: 'Sudden increases in email volume can trigger filtering',
        solution: 'Gradually increase sending volume and maintain consistent patterns'
      },
      {
        factor: 'Gmail Machine Learning',
        description: 'Gmail uses ML to detect spam patterns and user preferences',
        solution: 'Focus on relevant, valuable content that recipients want to receive'
      }
    ];

    gmailFactors.forEach(factor => {
      log(`📋 ${factor.factor}:`, 'cyan');
      log(`   Issue: ${factor.description}`, 'yellow');
      log(`   Solution: ${factor.solution}`, 'blue');
      this.addRecommendation(factor.solution);
    });
  }

  // Test with multiple email providers
  async testMultipleProviders() {
    log('\n🧪 Multi-Provider Delivery Test', 'blue');
    log('-'.repeat(40), 'blue');

    const testEmails = [
      { provider: 'Gmail', email: 'seulybegum53@gmail.com' },
      // Add more test emails if available
    ];

    log('📧 Testing email delivery to different providers...', 'blue');
    log('⚠️  This will send test emails - make sure recipients expect them!', 'yellow');
    
    // For now, just log the recommendation
    log('💡 Recommendation: Test with Yahoo, Outlook, and other providers', 'cyan');
    log('   If emails reach other providers but not Gmail, it confirms Gmail-specific filtering', 'cyan');
    
    this.addRecommendation('Test delivery to multiple email providers to isolate Gmail-specific issues');
  }

  // Generate Gmail-specific report
  generateGmailReport() {
    log('\n📊 Gmail Deliverability Report', 'cyan');
    log('=' .repeat(60), 'cyan');

    if (this.issues.length === 0) {
      log('✅ No major deliverability issues detected', 'green');
    } else {
      log(`⚠️  Found ${this.issues.length} potential deliverability issues:`, 'yellow');
      
      this.issues.forEach((item, index) => {
        const severityColor = item.severity === 'high' ? 'red' : item.severity === 'medium' ? 'yellow' : 'blue';
        log(`   ${index + 1}. [${item.severity.toUpperCase()}] ${item.issue}`, severityColor);
      });
    }

    log('\n💡 Key Recommendations:', 'cyan');
    this.recommendations.forEach((rec, index) => {
      log(`   ${index + 1}. ${rec}`, 'blue');
    });
  }

  // Provide specific solutions
  async provideSolutions() {
    log('\n🛠️  Immediate Action Items', 'cyan');
    log('=' .repeat(60), 'cyan');

    const senderEmail = process.env.SMTP_USER;
    const domain = senderEmail.split('@')[1];

    if (domain === 'gmail.com') {
      log('🎯 PRIMARY ISSUE IDENTIFIED: Gmail-to-Gmail Delivery', 'red');
      log('   Your emails are being sent from Gmail to Gmail, which triggers strict filtering.', 'red');
      log('', 'reset');
      
      log('📋 IMMEDIATE SOLUTIONS (in order of priority):', 'cyan');
      log('', 'reset');
      
      log('1. 🔍 CHECK RECIPIENT\'S FOLDERS:', 'green');
      log('   • Primary inbox', 'blue');
      log('   • Spam/Junk folder', 'blue');
      log('   • Promotions tab', 'blue');
      log('   • Updates tab', 'blue');
      log('   • All Mail folder', 'blue');
      log('', 'reset');
      
      log('2. 📧 ASK RECIPIENT TO:', 'green');
      log('   • Add your email to their contacts', 'blue');
      log('   • Mark email as "Not Spam" if in spam folder', 'blue');
      log('   • Move email to Primary tab if in Promotions', 'blue');
      log('   • Create a filter to always deliver to Primary', 'blue');
      log('', 'reset');
      
      log('3. 🏗️  LONG-TERM SOLUTION:', 'green');
      log('   • Set up custom domain email (e.g., noreply@hamsoya.com)', 'blue');
      log('   • Configure proper SPF/DKIM/DMARC records', 'blue');
      log('   • Gradually build sender reputation', 'blue');
      log('', 'reset');
      
      log('4. 🧪 IMMEDIATE TEST:', 'green');
      log('   • Send test email to a different provider (Yahoo, Outlook)', 'blue');
      log('   • If it arrives there, confirms Gmail-specific filtering', 'blue');
      log('', 'reset');
    }

    log('📞 DEBUGGING STEPS:', 'cyan');
    log('1. Check Gmail\'s Message Source (Show Original) for delivery path', 'blue');
    log('2. Look for X-Spam-Status and X-Gmail-Labels headers', 'blue');
    log('3. Monitor Gmail Postmaster Tools (if using custom domain)', 'blue');
    log('4. Test with Gmail\'s "Check My Email" tool', 'blue');
    log('', 'reset');

    log('🎯 EXPECTED OUTCOME:', 'green');
    log('After implementing these solutions, you should see:', 'green');
    log('• Emails appearing in recipient\'s inbox within 1-2 seconds', 'blue');
    log('• Improved delivery rates and engagement', 'blue');
    log('• Better sender reputation over time', 'blue');
  }
}

// Main function
async function runGmailDeliverabilityCheck() {
  log('🔍 Gmail Deliverability Checker & Improvement Tool', 'cyan');
  log('=' .repeat(60), 'cyan');
  log('Analyzing Gmail-specific delivery issues and providing solutions\n', 'blue');

  const checker = new GmailDeliverabilityChecker();
  
  try {
    await checker.checkGmailDeliverability();
    
    log('\n' + '='.repeat(60), 'cyan');
    log('🎉 Gmail deliverability analysis completed!', 'green');
    log('Follow the action items above to improve email delivery.', 'green');
    log('='.repeat(60), 'cyan');
    
    return true;
    
  } catch (error) {
    log(`💥 Analysis failed: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

// Run the checker
if (require.main === module) {
  runGmailDeliverabilityCheck()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`💥 Checker crashed: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runGmailDeliverabilityCheck, GmailDeliverabilityChecker };
