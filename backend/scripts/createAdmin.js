import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system');
    console.log('📦 Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      studentId: 'ADMIN001',
      email: 'admin@gmail.com',
      password: '123456',
      firstName: 'System',
      lastName: 'Administrator',
      department: 'Administration',
      year: 4,
      role: 'admin',
      isEmailVerified: true,
      bio: 'System administrator with full access to all voting system features',
      phoneNumber: '+1234567890'
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@gmail.com');
    console.log('🔐 Password: 123456');
    console.log('👨‍💼 Role: admin');
    console.log('🎓 Department: Administration');
    console.log('📱 Student ID: ADMIN001');
    console.log('\n🚀 You can now login with these credentials to access the admin portal!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    
    if (error.code === 11000) {
      console.log('👤 Admin user might already exist with this email or student ID');
    }
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
    process.exit(0);
  }
};

createAdminUser();