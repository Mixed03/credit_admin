// scripts/fix-indexes.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('loanapplications');

    // Get current indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    // Check if email_1 index exists
    const emailIndex = indexes.find(idx => idx.name === 'email_1');
    
    if (emailIndex) {
      console.log('Dropping email_1 index...');
      await collection.dropIndex('email_1');
      console.log('✅ email_1 index dropped successfully');
    } else {
      console.log('ℹ️ email_1 index does not exist');
    }

    // ADD THIS SECTION - Drop idNumber_1 index
    const idNumberIndex = indexes.find(idx => idx.name === 'idNumber_1');
    
    if (idNumberIndex) {
      console.log('Dropping idNumber_1 index...');
      await collection.dropIndex('idNumber_1');
      console.log('✅ idNumber_1 index dropped successfully');
    } else {
      console.log('ℹ️ idNumber_1 index does not exist');
    }
    // END OF NEW SECTION

    // Verify final indexes
    const finalIndexes = await collection.indexes();
    console.log('Final indexes:', finalIndexes);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixIndexes();