import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const fixElectionIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system');
    console.log('📦 Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('elections');

    // Get current indexes
    const indexes = await collection.indexes();
    console.log('📋 Current indexes:', indexes.map(idx => idx.name));

    // Drop the problematic compound index if it exists
    try {
      await collection.dropIndex({ eligibleDepartments: 1, eligibleYears: 1 });
      console.log('✅ Dropped problematic compound index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️ Compound index does not exist, skipping...');
      } else {
        console.log('❌ Error dropping index:', error.message);
      }
    }

    // Create the new separate indexes
    try {
      await collection.createIndex({ eligibleDepartments: 1 });
      console.log('✅ Created eligibleDepartments index');
    } catch (error) {
      console.log('ℹ️ eligibleDepartments index might already exist');
    }

    try {
      await collection.createIndex({ eligibleYears: 1 });
      console.log('✅ Created eligibleYears index');
    } catch (error) {
      console.log('ℹ️ eligibleYears index might already exist');
    }

    // Show final indexes
    const finalIndexes = await collection.indexes();
    console.log('📋 Final indexes:', finalIndexes.map(idx => idx.name));

    console.log('🎉 Index fixing completed successfully!');

  } catch (error) {
    console.error('❌ Error fixing indexes:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from MongoDB');
    process.exit(0);
  }
};

fixElectionIndexes();