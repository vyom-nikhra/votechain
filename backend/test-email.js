import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create the same transporter as in your app
const emailTransporter = nodemailer.createTransport({
  service: 'gmail', // Change to 'outlook' for Outlook/Hotmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test email function
const testEmail = async () => {
  console.log('🔧 Testing email configuration...');
  console.log(`📧 Email User: ${process.env.EMAIL_USER}`);
  console.log(`🔑 Email Password: ${process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET'}`);
  
  try {
    // Verify transporter
    console.log('\n1. Verifying email transporter...');
    await emailTransporter.verify();
    console.log('✅ Email transporter verified successfully!');
    
    // Send test email
    console.log('\n2. Sending test email...');
    const testEmailAddress = process.env.EMAIL_USER; // Send to yourself for testing
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: testEmailAddress,
      subject: '🎉 VoteChain Email System Test',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #2563eb;">🎉 Email System Working!</h2>
          <p>Congratulations! Your VoteChain email system is configured correctly.</p>
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0369a1; margin: 0;">Configuration Details:</h3>
            <ul style="margin: 10px 0;">
              <li><strong>Email Service:</strong> Gmail</li>
              <li><strong>From Address:</strong> ${process.env.EMAIL_USER}</li>
              <li><strong>Test Date:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          <p>Your student voting system is ready to send verification emails! 🚀</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">VoteChain - Blockchain Voting System</p>
        </div>
      `
    };
    
    const result = await emailTransporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log(`📬 Message ID: ${result.messageId}`);
    console.log(`📧 Sent to: ${testEmailAddress}`);
    
    console.log('\n🎉 EMAIL SYSTEM IS WORKING PERFECTLY!');
    console.log('💡 Check your inbox for the test email.');
    
  } catch (error) {
    console.error('\n❌ EMAIL TEST FAILED:');
    console.error(`Error: ${error.message}`);
    
    // Provide helpful error messages
    if (error.message.includes('Invalid login')) {
      console.log('\n🔍 TROUBLESHOOTING TIPS:');
      console.log('1. Make sure you have enabled 2-Factor Authentication on Gmail');
      console.log('2. Generate an App Password (not your regular password)');
      console.log('3. Use the 16-character app password in EMAIL_PASSWORD');
      console.log('4. Check that EMAIL_USER is your complete Gmail address');
    } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
      console.log('\n🔍 NETWORK ERROR:');
      console.log('1. Check your internet connection');
      console.log('2. Make sure you\'re not behind a firewall blocking SMTP');
    } else {
      console.log('\n🔍 GENERAL TROUBLESHOOTING:');
      console.log('1. Double-check your .env file configuration');
      console.log('2. Make sure EMAIL_USER and EMAIL_PASSWORD are set correctly');
      console.log('3. Try using a different email service (outlook, etc.)');
    }
  }
  
  process.exit();
};

// Run the test
testEmail();