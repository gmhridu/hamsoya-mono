const { sendEnhancedOTPVerificationEmail } = require('./src/lib/sendEmail.ts');

async function sendTestEmail() {
  try {
    console.log('🚀 Sending test email...');
    
    // Test email data
    const testEmail = 'your-test-email@gmail.com'; // Replace with your Gmail
    const testName = 'M Hasan Hridoy';
    const testOTP = '116690';
    
    // Send the email
    await sendEnhancedOTPVerificationEmail(testEmail, testName, testOTP);
    
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Check your Gmail inbox: ${testEmail}`);
    
  } catch (error) {
    console.error('❌ Error sending test email:', error.message);
    console.error('Make sure your SMTP environment variables are set:');
    console.error('- SMTP_USER (your Gmail address)');
    console.error('- SMTP_PASSWORD (your Gmail app password)');
  }
}

// Run the test
sendTestEmail();
