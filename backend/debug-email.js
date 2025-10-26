import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔧 Advanced Email Troubleshooting');
console.log('================================');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length);
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD);

// Test different configurations
const configs = [
  {
    name: 'Gmail Service (Original)',
    config: {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    }
  },
  {
    name: 'Gmail SMTP Direct',
    config: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    }
  },
  {
    name: 'Gmail SMTP Secure',
    config: {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    }
  }
];

const testConfig = async (configObj) => {
  console.log(`\n🧪 Testing: ${configObj.name}`);
  console.log('=====================================');
  
  try {
    const transporter = nodemailer.createTransport(configObj.config);
    
    // Test verification
    const verified = await transporter.verify();
    console.log('✅ Configuration verified successfully!');
    
    // Test sending a simple email
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: `Email Test - ${configObj.name}`,
      text: `This is a test email using ${configObj.name} configuration. If you receive this, the configuration is working!`
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', result.messageId);
    console.log('🎉 This configuration works!');
    
    return true;
  } catch (error) {
    console.log('❌ Configuration failed:', error.message);
    return false;
  }
};

// Test all configurations
const testAllConfigs = async () => {
  console.log('\n🔍 Starting comprehensive email configuration tests...\n');
  
  for (const config of configs) {
    const success = await testConfig(config);
    if (success) {
      console.log(`\n🎉 WORKING CONFIGURATION FOUND: ${config.name}`);
      console.log('Use this configuration in your auth.js file!');
      console.log('Configuration details:', JSON.stringify(config.config, null, 2));
      break;
    }
    console.log('---');
  }
  
  console.log('\n🏁 Email configuration testing completed!');
  process.exit();
};

testAllConfigs();