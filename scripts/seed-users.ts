// scripts/seed-users.ts
// Run with: npx ts-node scripts/seed-users.ts

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface User {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'officer' | 'manager';
  status: 'Active' | 'Inactive';
}

const demoUsers: User[] = [
  {
    email: 'admin@ndtmfi.la',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    status: 'Active',
  },
  {
    email: 'officer@ndtmfi.la',
    password: 'officer123',
    name: 'Loan Officer',
    role: 'officer',
    status: 'Active',
  },
  {
    email: 'manager@ndtmfi.la',
    password: 'manager123',
    name: 'Branch Manager',
    role: 'manager',
    status: 'Active',
  },
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env.local');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Define User schema
    const userSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      name: { type: String, required: true },
      role: {
        type: String,
        enum: ['admin', 'officer', 'manager'],
        default: 'officer',
      },
      status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
      },
    });

    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Clear existing users
    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});
    console.log('✅ Cleared existing users\n');

    // Hash and insert demo users
    console.log('🔐 Creating demo users...\n');
    for (const userData of demoUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      await User.create({
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        status: userData.status,
      });

      console.log(`✅ Created: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Role: ${userData.role}\n`);
    }

    console.log('🎉 Demo users seeded successfully!\n');
    console.log('You can now login with:');
    console.log('  Email: admin@ndtmfi.la');
    console.log('  Password: admin123');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();