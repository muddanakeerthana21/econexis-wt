import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function fixDemoUsers() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/econexis');
  const db = mongoose.connection.db;
  const users = db.collection('users');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Password123', salt);
  
  const result = await users.updateMany(
    { email: { $in: ['user@econexis.com', 'admin@econexis.com', 'delivery@econexis.com'] } },
    { $set: { password: hashedPassword, status: 'Active' } }
  );
  console.log(`Updated ${result.modifiedCount} demo users with hashed Password123`);
  process.exit(0);
}

fixDemoUsers().catch(console.error);
