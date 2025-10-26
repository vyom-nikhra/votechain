import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Election from './models/Election.js';
import Vote from './models/Vote.js';

// Load environment variables
dotenv.config();

const cleanDatabase = async () => {
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system');
    console.log('✅ Connected to MongoDB');
    
    // 1. Delete all votes
    console.log('\n🗳️  Deleting all votes...');
    const deletedVotes = await Vote.deleteMany({});
    console.log(`✅ Deleted ${deletedVotes.deletedCount} votes`);
    
    // 2. Delete all elections
    console.log('\n🏛️  Deleting all elections...');
    const deletedElections = await Election.deleteMany({});
    console.log(`✅ Deleted ${deletedElections.deletedCount} elections`);
    
    // 3. Delete all non-admin users
    console.log('\n👥 Deleting all non-admin users...');
    const deletedUsers = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`✅ Deleted ${deletedUsers.deletedCount} student users`);
    
    // 4. Reset admin users (clear voting history and NFT badges)
    console.log('\n🔧 Cleaning admin user data...');
    const updatedAdmins = await User.updateMany(
      { role: 'admin' },
      {
        $set: {
          votingHistory: [],
          nftBadges: [],
          isEmailVerified: true, // Ensure admins are verified
          lastLogin: new Date()
        },
        $unset: {
          emailVerificationToken: 1,
          emailVerificationExpires: 1,
          passwordResetToken: 1,
          passwordResetExpires: 1
        }
      }
    );
    console.log(`✅ Cleaned ${updatedAdmins.modifiedCount} admin accounts`);
    
    // 5. Show remaining data summary
    console.log('\n📊 Database Summary After Cleanup:');
    const remainingUsers = await User.countDocuments();
    const remainingAdmins = await User.countDocuments({ role: 'admin' });
    const remainingStudents = await User.countDocuments({ role: 'student' });
    const remainingElections = await Election.countDocuments();
    const remainingVotes = await Vote.countDocuments();
    
    console.log(`   👥 Total Users: ${remainingUsers}`);
    console.log(`   🔑 Admin Users: ${remainingAdmins}`);
    console.log(`   🎓 Student Users: ${remainingStudents}`);
    console.log(`   🏛️  Elections: ${remainingElections}`);
    console.log(`   🗳️  Votes: ${remainingVotes}`);
    
    if (remainingAdmins > 0) {
      console.log('\n👑 Remaining Admin Users:');
      const admins = await User.find({ role: 'admin' }).select('firstName lastName email studentId');
      admins.forEach(admin => {
        console.log(`   - ${admin.firstName} ${admin.lastName} (${admin.email})`);
      });
    } else {
      console.log('\n⚠️  WARNING: No admin users found!');
      console.log('💡 You may want to create an admin user before starting the application.');
    }
    
    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('🚀 Your VoteChain system is ready for a fresh start!');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
    console.error(error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit();
  }
};

// Run the cleanup
console.log('🧹 VoteChain Database Cleanup Tool');
console.log('=====================================');
console.log('This will delete all elections, votes, and student users.');
console.log('Admin users will be preserved but their data will be reset.');
console.log('');

cleanDatabase();